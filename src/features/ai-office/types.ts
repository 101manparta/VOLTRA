/**
 * VOLTRA AI Office — Types and Models
 * 
 * Defines the domain model for the 3D Virtual Software Engineering Office:
 * Agents, Roles, States, Zones, Events, and Camera Presets.
 */

export type AgentRole =
  | 'ORCHESTRATOR'
  | 'FRONTEND'
  | 'BACKEND'
  | 'DATABASE'
  | 'TESTER'
  | 'DEVOPS';

export type AgentStatus =
  | 'IDLE'
  | 'WORKING'
  | 'THINKING'
  | 'TESTING'
  | 'WAITING'
  | 'ERROR'
  | 'COMPLETED';

export type OfficeZone =
  | 'orchestrator'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'testing'
  | 'devops'
  | 'meeting';

export interface AgentActivityItem {
  id: string;
  timestamp: string;
  message: string;
  type: 'done' | 'active' | 'pending' | 'error';
}

export interface AgentMetrics {
  tasksCompleted: number;
  linesOfCode?: number;
  testPassRate?: number;
  uptime: string;
}

export interface AgentState {
  id: string;
  name: string;
  role: AgentRole;
  title: string;
  avatarColor: string;
  secondaryColor: string;
  status: AgentStatus;
  task: string;
  progress: number; // 0 - 100
  location: OfficeZone;
  deskPosition: [number, number, number];
  currentPosition: [number, number, number];
  targetPosition: [number, number, number];
  rotationY: number;
  activityLog: AgentActivityItem[];
  metrics: AgentMetrics;
  updatedAt: string;
}

export type AgentEventType =
  | 'agent_started'
  | 'task_started'
  | 'task_progress'
  | 'agent_thinking'
  | 'test_started'
  | 'test_completed'
  | 'task_completed'
  | 'agent_error';

export interface AgentEvent {
  id: string;
  agentId: string;
  eventType: AgentEventType;
  message: string;
  taskTitle?: string;
  progress?: number;
  targetLocation?: OfficeZone;
  timestamp: string;
}

export type CameraPreset =
  | 'overview'
  | 'orchestrator'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'testing'
  | 'devops';

export interface ZoneConfig {
  id: OfficeZone;
  label: string;
  description: string;
  position: [number, number, number];
  color: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}
