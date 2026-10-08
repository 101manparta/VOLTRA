/**
 * VOLTRA AI Office — Agent Event Adapter
 * 
 * Standard adapter interface allowing external agent execution engines
 * (e.g., Antigravity Agent, CI/CD runners, local CLI, or Supabase Realtime)
 * to stream lifecycle events to the 3D Virtual AI Office.
 */

import { AgentEvent, AgentEventType, AgentRole, AgentState, AgentStatus, OfficeZone } from '../types';
import { OFFICE_ZONES } from '../data/initialAgents';

export type EventCallback = (event: AgentEvent, updatedState: AgentState) => void;

class AgentEventAdapter {
  private listeners: Set<EventCallback> = new Set();

  /**
   * Subscribe to incoming agent state events
   */
  subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Dispatches an external or synthetic event to update an agent
   */
  handleEvent(
    currentAgents: AgentState[],
    event: AgentEvent
  ): { updatedAgents: AgentState[]; updatedAgent?: AgentState } {
    const targetAgentIndex = currentAgents.findIndex(
      (a) => a.id === event.agentId || a.role.toLowerCase() === event.agentId.toLowerCase()
    );

    if (targetAgentIndex === -1) {
      return { updatedAgents: currentAgents };
    }

    const currentAgent = currentAgents[targetAgentIndex];
    let nextStatus: AgentStatus = currentAgent.status;
    let nextProgress = event.progress ?? currentAgent.progress;
    let nextLocation: OfficeZone = event.targetLocation ?? currentAgent.location;
    let nextTask = event.taskTitle ?? currentAgent.task;

    switch (event.eventType) {
      case 'agent_started':
        nextStatus = 'WORKING';
        break;
      case 'task_started':
        nextStatus = 'WORKING';
        nextProgress = event.progress ?? 5;
        break;
      case 'task_progress':
        nextStatus = 'WORKING';
        nextProgress = Math.min(100, Math.max(0, event.progress ?? nextProgress + 10));
        break;
      case 'agent_thinking':
        nextStatus = 'THINKING';
        break;
      case 'test_started':
        nextStatus = 'TESTING';
        nextLocation = 'testing';
        break;
      case 'test_completed':
        nextStatus = 'WORKING';
        break;
      case 'task_completed':
        nextStatus = 'COMPLETED';
        nextProgress = 100;
        break;
      case 'agent_error':
        nextStatus = 'ERROR';
        break;
      default:
        break;
    }

    const targetZone = OFFICE_ZONES[nextLocation] || OFFICE_ZONES.orchestrator;
    const targetPosition: [number, number, number] = [
      targetZone.position[0],
      targetZone.position[1],
      targetZone.position[2]
    ];

    const updatedAgent: AgentState = {
      ...currentAgent,
      status: nextStatus,
      task: nextTask,
      progress: nextProgress,
      location: nextLocation,
      targetPosition,
      activityLog: [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: 'Just now',
          message: event.message,
          type: nextStatus === 'ERROR' ? 'error' : nextStatus === 'COMPLETED' ? 'done' : 'active'
        },
        ...currentAgent.activityLog.slice(0, 9)
      ],
      updatedAt: new Date().toISOString()
    };

    const updatedAgents = [...currentAgents];
    updatedAgents[targetAgentIndex] = updatedAgent;

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event, updatedAgent);
      } catch (err) {
        console.error('Agent event listener error:', err);
      }
    });

    return { updatedAgents, updatedAgent };
  }

  /**
   * Helper to format an Antigravity CLI event into an AgentEvent
   */
  createEvent(
    agentId: string,
    eventType: AgentEventType,
    message: string,
    options?: { taskTitle?: string; progress?: number; targetLocation?: OfficeZone }
  ): AgentEvent {
    return {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      agentId,
      eventType,
      message,
      taskTitle: options?.taskTitle,
      progress: options?.progress,
      targetLocation: options?.targetLocation,
      timestamp: new Date().toISOString()
    };
  }
}

export const agentEventAdapter = new AgentEventAdapter();
