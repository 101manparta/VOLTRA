-- ==============================================================================
-- 00003_ai_office_agents.sql
-- VOLTRA 3D Virtual AI Software Engineering Office Schema
-- ==============================================================================

-- 1. Agent States Table
CREATE TABLE IF NOT EXISTS public.ai_agent_states (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ORCHESTRATOR', 'FRONTEND', 'BACKEND', 'DATABASE', 'TESTER', 'DEVOPS')),
    title TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('IDLE', 'WORKING', 'THINKING', 'TESTING', 'WAITING', 'ERROR', 'COMPLETED')),
    task TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    location TEXT NOT NULL CHECK (location IN ('orchestrator', 'frontend', 'backend', 'database', 'testing', 'devops', 'meeting')),
    desk_position JSONB NOT NULL DEFAULT '[0, 0, 0]'::jsonb,
    current_position JSONB NOT NULL DEFAULT '[0, 0, 0]'::jsonb,
    target_position JSONB NOT NULL DEFAULT '[0, 0, 0]'::jsonb,
    activity_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Agent Events Stream Table (For Realtime Subscriptions)
CREATE TABLE IF NOT EXISTS public.ai_agent_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT NOT NULL REFERENCES public.ai_agent_states(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('agent_started', 'task_started', 'task_progress', 'agent_thinking', 'test_started', 'test_completed', 'task_completed', 'agent_error')),
    message TEXT NOT NULL,
    task_title TEXT,
    progress INTEGER CHECK (progress BETWEEN 0 AND 100),
    target_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.ai_agent_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_events ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Public read ai_agent_states"
    ON public.ai_agent_states FOR SELECT
    USING (true);

CREATE POLICY "Public read ai_agent_events"
    ON public.ai_agent_events FOR SELECT
    USING (true);

CREATE POLICY "Service and Admin write ai_agent_states"
    ON public.ai_agent_states FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role' OR public.is_admin())
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR public.is_admin());

CREATE POLICY "Service and Admin write ai_agent_events"
    ON public.ai_agent_events FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role' OR public.is_admin())
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR public.is_admin());

-- 5. Seed Initial 6 AI Software Engineering Agents
INSERT INTO public.ai_agent_states (id, name, role, title, avatar_color, secondary_color, status, task, progress, location, desk_position, current_position, target_position, metrics)
VALUES
('orchestrator-01', 'Atlas Orchestrator', 'ORCHESTRATOR', 'Lead System Architect', '#10B981', '#34D399', 'WORKING', 'Coordinating full-stack EV charging pipeline with real-time CPO telemetry', 88, 'orchestrator', '[0,0,0]'::jsonb, '[0,0,0]'::jsonb, '[0,0,0]'::jsonb, '{"tasksCompleted": 42, "uptime": "99.98%"}'::jsonb),
('frontend-01', 'Pixel Frontend', 'FRONTEND', 'Senior UI/UX & Three.js Engineer', '#06B6D4', '#22D3EE', 'WORKING', 'Implementing 3D Virtual AI Office with interactive agent avatars & raycasting', 74, 'frontend', '[-6,0,-3.5]'::jsonb, '[-6,0,-3.5]'::jsonb, '[-6,0,-3.5]'::jsonb, '{"tasksCompleted": 38, "testPassRate": 100, "uptime": "99.95%"}'::jsonb),
('backend-01', 'Vanguard Backend', 'BACKEND', 'High-Throughput API Engineer', '#8B5CF6', '#A78BFA', 'WORKING', 'Building normalized OCPI 2.2.1 provider adapter & live session streaming API', 82, 'backend', '[-6,0,3.5]'::jsonb, '[-6,0,3.5]'::jsonb, '[-6,0,3.5]'::jsonb, '{"tasksCompleted": 51, "testPassRate": 100, "uptime": "99.99%"}'::jsonb),
('database-01', 'Nexus Database', 'DATABASE', 'PostgreSQL & PostGIS DBA', '#F59E0B', '#FBBF24', 'THINKING', 'Analyzing PostGIS ST_DWithin query execution plan for 50,000 concurrent hubs', 60, 'database', '[6,0,3.5]'::jsonb, '[6,0,3.5]'::jsonb, '[6,0,3.5]'::jsonb, '{"tasksCompleted": 29, "testPassRate": 100, "uptime": "100%"}'::jsonb),
('tester-01', 'Sentinel Tester', 'TESTER', 'Automated QA & Security Engine', '#EC4899', '#F472B6', 'TESTING', 'Running full Vitest suite: geospatial accuracy, session lifecycle & RLS matrix', 95, 'testing', '[6,0,-3.5]'::jsonb, '[6,0,-3.5]'::jsonb, '[6,0,-3.5]'::jsonb, '{"tasksCompleted": 64, "testPassRate": 100, "uptime": "99.99%"}'::jsonb),
('devops-01', 'Titan DevOps', 'DEVOPS', 'Cloud Infrastructure & SRE', '#3B82F6', '#60A5FA', 'WORKING', 'Monitoring container cluster health, load balancers & real-time telemetry pipelines', 85, 'devops', '[0,0,-7]'::jsonb, '[0,0,-7]'::jsonb, '[0,0,-7]'::jsonb, '{"tasksCompleted": 47, "testPassRate": 100, "uptime": "99.999%"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    task = EXCLUDED.task,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    updated_at = NOW();
