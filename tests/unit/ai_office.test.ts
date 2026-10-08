import { describe, it, expect } from 'vitest';
import { INITIAL_AGENTS, OFFICE_ZONES } from '../../src/features/ai-office/data/initialAgents';
import { agentEventAdapter } from '../../src/features/ai-office/services/agentEventAdapter';
import { AgentRole, AgentState } from '../../src/features/ai-office/types';

describe('VOLTRA AI Office — Domain Models & Event Adapter', () => {
  it('initializes exactly 6 specialized software engineering agents', () => {
    expect(INITIAL_AGENTS.length).toBe(6);

    const roles: AgentRole[] = ['ORCHESTRATOR', 'FRONTEND', 'BACKEND', 'DATABASE', 'TESTER', 'DEVOPS'];
    for (const role of roles) {
      const agent = INITIAL_AGENTS.find((a) => a.role === role);
      expect(agent).toBeDefined();
      expect(agent?.task.length).toBeGreaterThan(10);
      expect(agent?.avatarColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(agent?.activityLog.length).toBeGreaterThan(0);
      expect(agent?.metrics.tasksCompleted).toBeGreaterThan(0);
    }
  });

  it('defines 6 spatial office zones with distinct 3D camera coordinates', () => {
    const zoneKeys = ['orchestrator', 'frontend', 'backend', 'database', 'testing', 'devops'];
    for (const key of zoneKeys) {
      const zone = OFFICE_ZONES[key];
      expect(zone).toBeDefined();
      expect(zone.position.length).toBe(3);
      expect(zone.cameraPosition.length).toBe(3);
      expect(zone.cameraTarget.length).toBe(3);
    }
  });

  it('transforms external Antigravity/agent events into state transitions', () => {
    const agents = [...INITIAL_AGENTS];
    const event = agentEventAdapter.createEvent(
      'frontend-01',
      'task_progress',
      'Compiled WebGL 60FPS shader with dynamic emissive runners',
      { progress: 92, taskTitle: 'Optimizing Three.js rendering pipeline' }
    );

    const { updatedAgents, updatedAgent } = agentEventAdapter.handleEvent(agents, event);

    expect(updatedAgent).toBeDefined();
    expect(updatedAgent?.id).toBe('frontend-01');
    expect(updatedAgent?.status).toBe('WORKING');
    expect(updatedAgent?.progress).toBe(92);
    expect(updatedAgent?.task).toBe('Optimizing Three.js rendering pipeline');
    expect(updatedAgent?.activityLog[0].message).toContain('Compiled WebGL 60FPS');
  });

  it('updates agent target location to testing zone on test_started event', () => {
    const agents = [...INITIAL_AGENTS];
    const event = agentEventAdapter.createEvent(
      'backend-01',
      'test_started',
      'Validating OCPI 2.2.1 payload against test suite',
      { targetLocation: 'testing' }
    );

    const { updatedAgent } = agentEventAdapter.handleEvent(agents, event);

    expect(updatedAgent?.status).toBe('TESTING');
    expect(updatedAgent?.location).toBe('testing');
    expect(updatedAgent?.targetPosition).toEqual([6, 0, -3.5]); // Testing zone position
  });

  it('records task completion and sets progress to 100%', () => {
    const agents = [...INITIAL_AGENTS];
    const event = agentEventAdapter.createEvent(
      'devops-01',
      'task_completed',
      'Canary deployment verified with zero 5xx errors'
    );

    const { updatedAgent } = agentEventAdapter.handleEvent(agents, event);

    expect(updatedAgent?.status).toBe('COMPLETED');
    expect(updatedAgent?.progress).toBe(100);
    expect(updatedAgent?.activityLog[0].type).toBe('done');
  });
});
