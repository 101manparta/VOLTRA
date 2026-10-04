-- ==============================================================================
-- VOLTARA EV Mobility Intelligence Platform
-- Migration: 00001_initial_schema.sql
-- Description: Core schema, PostGIS extensions, multi-tenant organizations,
--              chargers, connectors, sessions, confidence snapshots, alerts,
--              audit logs, RLS policies, and spatial query RPCs.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'OPERATOR', 'FLEET_MANAGER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM ('OPERATOR', 'FLEET', 'PLATFORM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE org_member_role AS ENUM ('OWNER', 'ADMIN', 'OPERATOR', 'DISPATCHER', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE station_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'OFFLINE', 'FAULT', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connector_type AS ENUM ('CCS2', 'Type2', 'CHAdeMO', 'NACS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connector_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'OUT_OF_SERVICE', 'RESERVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('READY', 'CHARGING', 'REQUIRES_ATTENTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('PENDING', 'CHARGING', 'COMPLETED', 'PAUSED', 'FAILED', 'ABORTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('CRITICAL', 'WARNING', 'INFO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_action_type AS ENUM ('NAVIGATE', 'STOP_CHARGE', 'VIEW_STATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. ORGANIZATIONS TABLE (Multi-tenant Operators & Fleets)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type organization_type NOT NULL,
    logo_url TEXT,
    contact_email TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- 5. ORGANIZATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role org_member_role NOT NULL DEFAULT 'VIEWER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

-- 6. VEHICLES TABLE (Retail user EV or Commercial Fleet asset)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    plate_number TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    battery_capacity_kwh NUMERIC(6, 2) NOT NULL DEFAULT 72.6,
    current_battery_percent INT NOT NULL DEFAULT 65 CHECK (current_battery_percent BETWEEN 0 AND 100),
    max_charge_power_kw NUMERIC(6, 2) NOT NULL DEFAULT 150.0,
    preferred_connector connector_type NOT NULL DEFAULT 'CCS2',
    status vehicle_status NOT NULL DEFAULT 'READY',
    depot_location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT vehicle_owner_check CHECK (owner_user_id IS NOT NULL OR organization_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON public.vehicles(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_org ON public.vehicles(organization_id);

-- 7. CHARGERS TABLE (Charging Stations with PostGIS Geography)
CREATE TABLE IF NOT EXISTS public.chargers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    operator_name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    status station_status NOT NULL DEFAULT 'AVAILABLE',
    health_status TEXT NOT NULL DEFAULT 'NOMINAL',
    pricing_per_kwh NUMERIC(10, 2) NOT NULL DEFAULT 2466.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    queue_length INT NOT NULL DEFAULT 0 CHECK (queue_length >= 0),
    estimated_wait_minutes INT NOT NULL DEFAULT 0 CHECK (estimated_wait_minutes >= 0),
    confidence_score INT NOT NULL DEFAULT 90 CHECK (confidence_score BETWEEN 0 AND 100),
    last_reported_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Spatial GIST index for fast geo bounding/distance queries
CREATE INDEX IF NOT EXISTS idx_chargers_location ON public.chargers USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_chargers_status ON public.chargers(status);
CREATE INDEX IF NOT EXISTS idx_chargers_org ON public.chargers(organization_id);

-- Trigger to auto-sync PostGIS location from latitude & longitude
CREATE OR REPLACE FUNCTION public.sync_charger_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_charger_location ON public.chargers;
CREATE TRIGGER trg_sync_charger_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON public.chargers
    FOR EACH ROW EXECUTE FUNCTION public.sync_charger_location();

-- 8. CHARGER CONNECTORS TABLE
CREATE TABLE IF NOT EXISTS public.charger_connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
    bay_number VARCHAR(20) NOT NULL,
    connector_type connector_type NOT NULL,
    max_power_kw NUMERIC(6, 2) NOT NULL DEFAULT 150.00,
    current_power_kw NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    status connector_status NOT NULL DEFAULT 'AVAILABLE',
    current_session_remaining_minutes INT,
    last_status_change TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(charger_id, bay_number)
);

CREATE INDEX IF NOT EXISTS idx_connectors_charger ON public.charger_connectors(charger_id);
CREATE INDEX IF NOT EXISTS idx_connectors_type ON public.charger_connectors(connector_type);

-- 9. CHARGER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.charger_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
    previous_status station_status,
    new_status station_status NOT NULL,
    source TEXT NOT NULL DEFAULT 'TELEMETRY_PING',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_status_history_charger ON public.charger_status_history(charger_id, recorded_at DESC);

-- Trigger to log status changes automatically
CREATE OR REPLACE FUNCTION public.log_charger_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.charger_status_history (charger_id, previous_status, new_status, source)
        VALUES (NEW.id, OLD.status, NEW.status, 'SYSTEM_TRIGGER');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_charger_status ON public.chargers;
CREATE TRIGGER trg_log_charger_status
    AFTER UPDATE OF status ON public.chargers
    FOR EACH ROW EXECUTE FUNCTION public.log_charger_status_change();

-- 10. CHARGING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.charging_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE RESTRICT,
    connector_id UUID NOT NULL REFERENCES public.charger_connectors(id) ON DELETE RESTRICT,
    state session_status NOT NULL DEFAULT 'CHARGING',
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    start_soc_percent INT NOT NULL DEFAULT 20,
    current_soc_percent INT NOT NULL DEFAULT 20,
    target_soc_percent INT NOT NULL DEFAULT 80,
    instantaneous_power_kw NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    energy_delivered_kwh NUMERIC(8, 3) NOT NULL DEFAULT 0.000,
    tariff_per_kwh NUMERIC(10, 2) NOT NULL DEFAULT 2466.00,
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    has_derating_anomaly BOOLEAN NOT NULL DEFAULT false,
    anomaly_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.charging_sessions(user_id, state);
CREATE INDEX IF NOT EXISTS idx_sessions_charger ON public.charging_sessions(charger_id);

-- 11. SESSION TELEMETRY TABLE (Time-series data)
CREATE TABLE IF NOT EXISTS public.session_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.charging_sessions(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    power_kw NUMERIC(6, 2) NOT NULL,
    soc_percent INT NOT NULL,
    voltage_v NUMERIC(6, 2) NOT NULL,
    current_a NUMERIC(6, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_telemetry ON public.session_telemetry(session_id, recorded_at ASC);

-- 12. CONFIDENCE SNAPSHOTS TABLE (5-Vector Deterministic Scoring Record)
CREATE TABLE IF NOT EXISTS public.confidence_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
    overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    availability_score INT NOT NULL CHECK (availability_score BETWEEN 0 AND 100),
    handshake_success_rate INT NOT NULL CHECK (handshake_success_rate BETWEEN 0 AND 100),
    power_stability_score INT NOT NULL CHECK (power_stability_score BETWEEN 0 AND 100),
    network_latency_score INT NOT NULL CHECK (network_latency_score BETWEEN 0 AND 100),
    payment_gateway_uptime INT NOT NULL CHECK (payment_gateway_uptime BETWEEN 0 AND 100),
    assessment_summary TEXT NOT NULL,
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_confidence_snapshots ON public.confidence_snapshots(charger_id, computed_at DESC);

-- 13. ACTIONABLE ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.actionable_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    charger_id UUID REFERENCES public.chargers(id) ON DELETE SET NULL,
    severity alert_severity NOT NULL DEFAULT 'INFO',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_label TEXT,
    action_type alert_action_type,
    target_id TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.actionable_alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON public.actionable_alerts(organization_id, is_read);

-- 14. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    payload JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_res ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 15. DATA SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMPTZ,
    sync_interval_seconds INT NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 16. POSTGIS SPATIAL RPC: get_nearby_chargers
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_nearby_chargers(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 25000.0,
    filter_connector TEXT DEFAULT NULL,
    min_power DOUBLE PRECISION DEFAULT 0.0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    operator_name TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION,
    status station_status,
    health_status TEXT,
    pricing_per_kwh NUMERIC,
    currency VARCHAR,
    queue_length INT,
    estimated_wait_minutes INT,
    confidence_score INT,
    last_reported_at TIMESTAMPTZ,
    connectors JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_geom GEOGRAPHY;
BEGIN
    user_geom := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.operator_name,
        c.address,
        c.latitude,
        c.longitude,
        ST_Distance(c.location, user_geom) AS distance_meters,
        c.status,
        c.health_status,
        c.pricing_per_kwh,
        c.currency,
        c.queue_length,
        c.estimated_wait_minutes,
        c.confidence_score,
        c.last_reported_at,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', conn.id,
                        'bayNumber', conn.bay_number,
                        'type', conn.connector_type,
                        'maxPowerKw', conn.max_power_kw,
                        'currentPowerKw', conn.current_power_kw,
                        'status', conn.status,
                        'currentSessionRemainingMinutes', conn.current_session_remaining_minutes
                    )
                )
                FROM public.charger_connectors conn
                WHERE conn.charger_id = c.id
                  AND (filter_connector IS NULL OR filter_connector = 'ALL' OR conn.connector_type::text = filter_connector)
                  AND conn.max_power_kw >= min_power
            ),
            '[]'::jsonb
        ) AS connectors
    FROM public.chargers c
    WHERE ST_DWithin(c.location, user_geom, radius_meters)
    ORDER BY distance_meters ASC;
END;
$$;

-- ==============================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charger_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charger_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confidence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actionable_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles:
-- Public can read basic profile info; user can update their own profile; cannot self-promote role
CREATE POLICY "Profiles readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Organizations:
CREATE POLICY "Public read verified organizations"
    ON public.organizations FOR SELECT
    USING (true);

CREATE POLICY "Admins manage organizations"
    ON public.organizations FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Organization Members:
CREATE POLICY "Org members can read colleagues"
    ON public.organization_members FOR SELECT
    TO authenticated
    USING (organization_id IN (SELECT public.user_org_ids()) OR public.is_admin());

-- Chargers (Public Discovery + Operator Write):
CREATE POLICY "Public can view chargers"
    ON public.chargers FOR SELECT
    USING (true);

CREATE POLICY "Operators manage own org chargers"
    ON public.chargers FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN', 'OPERATOR')
        )
        OR public.is_admin()
    );

-- Connectors:
CREATE POLICY "Public can view connectors"
    ON public.charger_connectors FOR SELECT
    USING (true);

CREATE POLICY "Operators manage own connectors"
    ON public.charger_connectors FOR ALL
    TO authenticated
    USING (
        charger_id IN (
            SELECT id FROM public.chargers
            WHERE organization_id IN (SELECT public.user_org_ids())
        )
        OR public.is_admin()
    );

-- Vehicles:
CREATE POLICY "Users view own or org vehicles"
    ON public.vehicles FOR SELECT
    TO authenticated
    USING (
        owner_user_id = auth.uid()
        OR organization_id IN (SELECT public.user_org_ids())
        OR public.is_admin()
    );

CREATE POLICY "Users manage own vehicles"
    ON public.vehicles FOR ALL
    TO authenticated
    USING (owner_user_id = auth.uid() OR public.is_admin())
    WITH CHECK (owner_user_id = auth.uid() OR public.is_admin());

-- Charging Sessions:
CREATE POLICY "Users view own charging sessions"
    ON public.charging_sessions FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR charger_id IN (SELECT id FROM public.chargers WHERE organization_id IN (SELECT public.user_org_ids()))
        OR public.is_admin()
    );

CREATE POLICY "Users can create and update own active session"
    ON public.charging_sessions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own active session"
    ON public.charging_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

-- Actionable Alerts:
CREATE POLICY "Users read targeted alerts"
    ON public.actionable_alerts FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR organization_id IN (SELECT public.user_org_ids())
        OR public.is_admin()
    );

-- Audit Logs:
CREATE POLICY "Admins only access audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());
