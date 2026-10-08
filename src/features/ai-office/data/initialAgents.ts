/**
 * VOLTRA AI Office — Initial Agents & Zones Data
 */

import { AgentState, ZoneConfig } from '../types';

export const OFFICE_ZONES: Record<string, ZoneConfig> = {
  orchestrator: {
    id: 'orchestrator',
    label: 'Orchestrator Hub',
    description: 'Architecture decomposition, sprint planning & task dispatch',
    position: [0, 0, 0],
    color: '#10B981', // Emerald
    cameraPosition: [0, 7, 7],
    cameraTarget: [0, 0.5, 0]
  },
  frontend: {
    id: 'frontend',
    label: 'Frontend Lab',
    description: 'UI/UX layout, Tailwind design system, WebGL 3D rendering',
    position: [-6, 0, -3.5],
    color: '#06B6D4', // Cyan
    cameraPosition: [-6, 6, 2],
    cameraTarget: [-6, 0.5, -3.5]
  },
  backend: {
    id: 'backend',
    label: 'Backend Operations',
    description: 'Express APIs, Supabase PostGIS queries, OCPI CPO adapters',
    position: [-6, 0, 3.5],
    color: '#8B5CF6', // Purple/Violet
    cameraPosition: [-6, 6, 9],
    cameraTarget: [-6, 0.5, 3.5]
  },
  database: {
    id: 'database',
    label: 'Database Sanctuary',
    description: 'PostgreSQL PostGIS spatial indexing & Row Level Security',
    position: [6, 0, 3.5],
    color: '#F59E0B', // Amber
    cameraPosition: [6, 6, 9],
    cameraTarget: [6, 0.5, 3.5]
  },
  testing: {
    id: 'testing',
    label: 'QA & Security Lab',
    description: 'Automated Vitest suites, RLS multi-tenant boundary checks',
    position: [6, 0, -3.5],
    color: '#EC4899', // Pink
    cameraPosition: [6, 6, 2],
    cameraTarget: [6, 0.5, -3.5]
  },
  devops: {
    id: 'devops',
    label: 'DevOps & Cloud Cluster',
    description: 'High-availability container deployment, CI/CD, live SRE telemetry',
    position: [0, 0, -7],
    color: '#3B82F6', // Blue
    cameraPosition: [0, 6, -1.5],
    cameraTarget: [0, 0.5, -7]
  }
};

export const INITIAL_AGENTS: AgentState[] = [
  {
    id: 'orchestrator-01',
    name: 'Atlas Orchestrator',
    role: 'ORCHESTRATOR',
    title: 'Lead System Architect',
    avatarColor: '#10B981',
    secondaryColor: '#34D399',
    status: 'WORKING',
    task: 'Coordinating full-stack EV charging pipeline with real-time CPO telemetry',
    progress: 88,
    location: 'orchestrator',
    deskPosition: [0, 0, 0],
    currentPosition: [0, 0, 0],
    targetPosition: [0, 0, 0],
    rotationY: 0,
    activityLog: [
      { id: 'a1', timestamp: '1m ago', message: 'Assigned OCPI adapter validation to Backend Agent', type: 'done' },
      { id: 'a2', timestamp: '3m ago', message: 'Approved PostGIS spatial query optimization RFC', type: 'done' },
      { id: 'a3', timestamp: 'Just now', message: 'Synthesizing team sprint deliverables', type: 'active' }
    ],
    metrics: {
      tasksCompleted: 42,
      linesOfCode: 12500,
      uptime: '99.98%'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'frontend-01',
    name: 'Pixel Frontend',
    role: 'FRONTEND',
    title: 'Senior UI/UX & Three.js Engineer',
    avatarColor: '#06B6D4',
    secondaryColor: '#22D3EE',
    status: 'WORKING',
    task: 'Implementing 3D Virtual AI Office with interactive agent avatars & raycasting',
    progress: 74,
    location: 'frontend',
    deskPosition: [-6, 0, -3.5],
    currentPosition: [-6, 0, -3.5],
    targetPosition: [-6, 0, -3.5],
    rotationY: Math.PI / 4,
    activityLog: [
      { id: 'f1', timestamp: '4m ago', message: 'Built procedural low-poly cyber desks and monitors', type: 'done' },
      { id: 'f2', timestamp: '2m ago', message: 'Added responsive camera controls with smooth lerp', type: 'done' },
      { id: 'f3', timestamp: 'Just now', message: 'Connecting agent state listener to 3D scene', type: 'active' }
    ],
    metrics: {
      tasksCompleted: 38,
      linesOfCode: 9800,
      testPassRate: 100,
      uptime: '99.95%'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'backend-01',
    name: 'Vanguard Backend',
    role: 'BACKEND',
    title: 'High-Throughput API Engineer',
    avatarColor: '#8B5CF6',
    secondaryColor: '#A78BFA',
    status: 'WORKING',
    task: 'Building normalized OCPI 2.2.1 provider adapter & live session streaming API',
    progress: 82,
    location: 'backend',
    deskPosition: [-6, 0, 3.5],
    currentPosition: [-6, 0, 3.5],
    targetPosition: [-6, 0, 3.5],
    rotationY: -Math.PI / 4,
    activityLog: [
      { id: 'b1', timestamp: '8m ago', message: 'Defined EVChargingProvider abstraction contracts', type: 'done' },
      { id: 'b2', timestamp: '3m ago', message: 'Configured Supabase client with anon key isolation', type: 'done' },
      { id: 'b3', timestamp: 'Just now', message: 'Streaming charge telemetry over WebSocket proxy', type: 'active' }
    ],
    metrics: {
      tasksCompleted: 51,
      linesOfCode: 15400,
      testPassRate: 100,
      uptime: '99.99%'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'database-01',
    name: 'Nexus Database',
    role: 'DATABASE',
    title: 'PostgreSQL & PostGIS DBA',
    avatarColor: '#F59E0B',
    secondaryColor: '#FBBF24',
    status: 'THINKING',
    task: 'Analyzing PostGIS ST_DWithin query execution plan for 50,000 concurrent hubs',
    progress: 60,
    location: 'database',
    deskPosition: [6, 0, 3.5],
    currentPosition: [6, 0, 3.5],
    targetPosition: [6, 0, 3.5],
    rotationY: -3 * Math.PI / 4,
    activityLog: [
      { id: 'd1', timestamp: '12m ago', message: 'Created GiST index on public.chargers (location)', type: 'done' },
      { id: 'd2', timestamp: '5m ago', message: 'Validated RLS policies for tenant organization isolation', type: 'done' },
      { id: 'd3', timestamp: 'Just now', message: 'Benchmarking spatial partition bounds', type: 'active' }
    ],
    metrics: {
      tasksCompleted: 29,
      linesOfCode: 4200,
      testPassRate: 100,
      uptime: '100%'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tester-01',
    name: 'Sentinel Tester',
    role: 'TESTER',
    title: 'Automated QA & Security Engine',
    avatarColor: '#EC4899',
    secondaryColor: '#F472B6',
    status: 'TESTING',
    task: 'Running full Vitest suite: geospatial accuracy, session lifecycle & RLS matrix',
    progress: 95,
    location: 'testing',
    deskPosition: [6, 0, -3.5],
    currentPosition: [6, 0, -3.5],
    targetPosition: [6, 0, -3.5],
    rotationY: 3 * Math.PI / 4,
    activityLog: [
      { id: 't1', timestamp: '6m ago', message: 'Verified 8 test files with 23 passing tests', type: 'done' },
      { id: 't2', timestamp: '2m ago', message: 'Asserted zero server key leaks in client bundle', type: 'done' },
      { id: 't3', timestamp: 'Just now', message: 'Executing regression test on agent state transitions', type: 'active' }
    ],
    metrics: {
      tasksCompleted: 64,
      linesOfCode: 6100,
      testPassRate: 100,
      uptime: '99.99%'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'devops-01',
    name: 'Titan DevOps',
    role: 'DEVOPS',
    title: 'Cloud Infrastructure & SRE',
    avatarColor: '#3B82F6',
    secondaryColor: '#60A5FA',
    status: 'WORKING',
    task: 'Monitoring container cluster health, load balancers & real-time telemetry pipelines',
    progress: 85,
    location: 'devops',
    deskPosition: [0, 0, -7],
    currentPosition: [0, 0, -7],
    targetPosition: [0, 0, -7],
    rotationY: Math.PI,
    activityLog: [
      { id: 'o1', timestamp: '15m ago', message: 'Configured automated zero-downtime rolling updates', type: 'done' },
      { id: 'o2', timestamp: '7m ago', message: 'Verified HTTPS SSL certificates & CORS headers', type: 'done' },
      { id: 'o3', timestamp: 'Just now', message: 'Optimizing container memory consumption to <120MB', type: 'active' }
    ],
    metrics: {
      tasksCompleted: 47,
      linesOfCode: 5200,
      testPassRate: 100,
      uptime: '99.999%'
    },
    updatedAt: new Date().toISOString()
  }
];
