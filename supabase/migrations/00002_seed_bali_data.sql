-- ==============================================================================
-- VOLTARA EV Mobility Intelligence Platform
-- Migration: 00002_seed_bali_data.sql
-- Description: Realistic Bali EV infrastructure seed data (Sanur, Denpasar,
--              Kuta, Jimbaran, Nusa Dua, Canggu, Ubud, Gianyar).
-- ==============================================================================

-- 1. SEED ORGANIZATIONS
INSERT INTO public.organizations (id, name, slug, type, contact_email, is_verified)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'PLN UID Bali (Icon+)', 'pln-bali', 'OPERATOR', 'spklu.bali@pln.co.id', true),
    ('a0000000-0000-0000-0000-000000000002', 'Voltron Indonesia Network', 'voltron-id', 'OPERATOR', 'support@voltron.id', true),
    ('a0000000-0000-0000-0000-000000000003', 'Starvo Ultra Fast Network', 'starvo-bali', 'OPERATOR', 'ops@starvo.co.id', true),
    ('b0000000-0000-0000-0000-000000000001', 'Bali Eco Trans Logistics', 'bali-eco-fleet', 'FLEET', 'dispatch@baliecotrans.com', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CHARGERS (WGS84 Real Coordinates across Bali)
INSERT INTO public.chargers (
    id, organization_id, name, operator_name, address,
    latitude, longitude, location, status, health_status,
    pricing_per_kwh, currency, queue_length, estimated_wait_minutes,
    confidence_score, last_reported_at, is_demo
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'SPKLU PLN Sanur Fast Hub',
    'PLN UID Bali',
    'Jl. Danau Tamblingan No. 88, Sanur, Denpasar Selatan',
    -8.6920, 115.2580,
    ST_SetSRID(ST_MakePoint(115.2580, -8.6920), 4326)::geography,
    'AVAILABLE', 'NOMINAL', 2466.00, 'IDR', 0, 0, 96, now() - INTERVAL '15 seconds', true
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'Voltron Discovery Mall Kuta Ultra',
    'Voltron Indonesia',
    'Jl. Kartika Plaza, Kuta, Kabupaten Badung',
    -8.7285, 115.1685,
    ST_SetSRID(ST_MakePoint(115.1685, -8.7285), 4326)::geography,
    'AVAILABLE', 'NOMINAL', 2466.00, 'IDR', 1, 14, 91, now() - INTERVAL '40 seconds', true
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'Starvo Trans Studio Mall Denpasar',
    'Starvo Network',
    'Jl. Imam Bonjol No. 440, Pemecutan Klod, Denpasar Barat',
    -8.7065, 115.1895,
    ST_SetSRID(ST_MakePoint(115.1895, -8.7065), 4326)::geography,
    'OCCUPIED', 'NOMINAL', 2466.00, 'IDR', 3, 38, 74, now() - INTERVAL '8 minutes', true
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'PLN Rayon Denpasar Kota',
    'PLN UID Bali',
    'Jl. P.B. Sudirman No. 2, Dauh Puri Klod, Denpasar Barat',
    -8.6720, 115.2230,
    ST_SetSRID(ST_MakePoint(115.2230, -8.6720), 4326)::geography,
    'AVAILABLE', 'NOMINAL', 2466.00, 'IDR', 0, 0, 94, now() - INTERVAL '1 minute', true
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'Voltron ITDC Nusa Dua Convention Hub',
    'Voltron Indonesia',
    'Kawasan Pariwisata Nusa Dua Lot NW-1, Benoa, Kuta Selatan',
    -8.7990, 115.2290,
    ST_SetSRID(ST_MakePoint(115.2290, -8.7990), 4326)::geography,
    'AVAILABLE', 'NOMINAL', 2466.00, 'IDR', 0, 0, 98, now() - INTERVAL '20 seconds', true
),
(
    'c0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000003',
    'Starvo Samasta Lifestyle Village Jimbaran',
    'Starvo Network',
    'Jl. Wanagiri No. 1, Jimbaran, Kuta Selatan',
    -8.7885, 115.1660,
    ST_SetSRID(ST_MakePoint(115.1660, -8.7885), 4326)::geography,
    'FAULT', 'THERMAL_DERATE', 2466.00, 'IDR', 2, 25, 48, now() - INTERVAL '24 minutes', true
),
(
    'c0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    'SPKLU PLN Ubud Monkey Forest',
    'PLN UID Bali',
    'Jl. Wenara Wana, Padangtegal, Ubud, Kabupaten Gianyar',
    -8.5190, 115.2630,
    ST_SetSRID(ST_MakePoint(115.2630, -8.5190), 4326)::geography,
    'AVAILABLE', 'NOMINAL', 2466.00, 'IDR', 1, 10, 88, now() - INTERVAL '3 minutes', true
),
(
    'c0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000002',
    'Voltron Batu Bolong Canggu Eco Hub',
    'Voltron Indonesia',
    'Jl. Pantai Batu Bolong No. 56, Canggu, Kuta Utara',
    -8.6515, 115.1325,
    ST_SetSRID(ST_MakePoint(115.1325, -8.6515), 4326)::geography,
    'AVAILABLE', 'NOMINAL', 2466.00, 'IDR', 0, 0, 93, now() - INTERVAL '45 seconds', true
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CONNECTORS
INSERT INTO public.charger_connectors (
    id, charger_id, bay_number, connector_type, max_power_kw, current_power_kw, status
) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Bay 01', 'CCS2', 150.0, 0.0, 'AVAILABLE'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Bay 02', 'CCS2', 150.0, 48.0, 'OCCUPIED'),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Bay 03', 'Type2', 22.0, 0.0, 'AVAILABLE'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Bay 01', 'CCS2', 200.0, 0.0, 'AVAILABLE'),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Bay 02', 'CHAdeMO', 60.0, 0.0, 'AVAILABLE'),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'Bay 01', 'CCS2', 100.0, 88.0, 'OCCUPIED'),
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 'Bay 01', 'CCS2', 120.0, 0.0, 'AVAILABLE'),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000005', 'Bay 01', 'CCS2', 200.0, 0.0, 'AVAILABLE'),
('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000006', 'Bay 01', 'CCS2', 100.0, 0.0, 'OUT_OF_SERVICE'),
('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000007', 'Bay 01', 'CCS2', 60.0, 0.0, 'AVAILABLE'),
('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000008', 'Bay 01', 'CCS2', 150.0, 0.0, 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED FLEET VEHICLES
INSERT INTO public.vehicles (
    id, organization_id, plate_number, make, model,
    battery_capacity_kwh, current_battery_percent, max_charge_power_kw,
    preferred_connector, status, depot_location, latitude, longitude
) VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'DK 1824 AB', 'Hyundai', 'Ioniq 5 Long Range', 72.6, 92, 220.0, 'CCS2', 'READY', 'Sanur Hub', -8.6920, 115.2580),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'DK 4910 ZZ', 'Wuling', 'Air EV Long Range', 26.7, 34, 6.6, 'Type2', 'CHARGING', 'Denpasar Depot', -8.6720, 115.2230),
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'DK 3311 EF', 'BYD', 'Atto 3 Extended', 60.48, 14, 88.0, 'CCS2', 'REQUIRES_ATTENTION', 'Kuta Sub-depot', -8.7285, 115.1685),
('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'DK 8821 OP', 'Toyota', 'bZ4X Panoramic', 71.4, 85, 150.0, 'CCS2', 'READY', 'Nusa Dua Depot', -8.7990, 115.2290)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED INITIAL OPERATIONAL ALERTS
INSERT INTO public.actionable_alerts (
    id, charger_id, severity, title, description,
    action_label, action_type, is_read
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000006',
    'CRITICAL',
    'Thermal Derate & Out of Service: Jimbaran Bay 01',
    'Liquid cooling unit telemetry reported 72°C junction temperature. Stall auto-throttled to 0 kW.',
    'Reroute Traffic',
    'NAVIGATE',
    false
),
(
    'f0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'WARNING',
    'Severe Queue: Trans Studio Mall (3 vehicles waiting)',
    'Estimated queue duration has reached 38 minutes. Recommend Sanur Fast Hub as 12-minute faster alternative.',
    'View Suggestion',
    'VIEW_STATION',
    false
)
ON CONFLICT (id) DO NOTHING;
