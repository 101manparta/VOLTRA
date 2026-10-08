/**
 * VOLTRA AI Office — useAiOffice Hook
 * 
 * Manages:
 * - 3D Agent States & Positions
 * - Realtime Supabase Event Subscriptions
 * - Realistic Demo Mode Simulator
 * - Camera Presets & Selected Agent Focus
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import { INITIAL_AGENTS, OFFICE_ZONES } from '../data/initialAgents';
import { agentEventAdapter } from '../services/agentEventAdapter';
import { AgentEvent, AgentState, CameraPreset } from '../types';

export function useAiOffice() {
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('orchestrator-01');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [recentEvents, setRecentEvents] = useState<AgentEvent[]>([
    {
      id: 'init-1',
      agentId: 'orchestrator-01',
      eventType: 'task_started',
      message: 'System architect initialized sprint coordination',
      taskTitle: 'Coordinating full-stack EV charging pipeline',
      progress: 88,
      timestamp: '1m ago'
    },
    {
      id: 'init-2',
      agentId: 'frontend-01',
      eventType: 'task_progress',
      message: 'Compiled Three.js shader pipeline with 60 FPS target',
      progress: 74,
      timestamp: '2m ago'
    },
    {
      id: 'init-3',
      agentId: 'tester-01',
      eventType: 'test_completed',
      message: 'All 8 unit and integration test suites passed with 0 errors',
      progress: 95,
      timestamp: 'Just now'
    }
  ]);

  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Handler for dispatching events into state
  const handleIncomingEvent = useCallback((event: AgentEvent) => {
    setAgents((prev) => {
      const { updatedAgents } = agentEventAdapter.handleEvent(prev, event);
      return updatedAgents;
    });

    setRecentEvents((prev) => [event, ...prev.slice(0, 19)]);
  }, []);

  // Set up Supabase Realtime channel if available
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const client = getSupabase();
    if (!client) return;

    try {
      const channel = client
        .channel('public:ai_agent_events')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ai_agent_events' },
          (payload: any) => {
            const raw = payload.new as any;
            if (raw && raw.agent_id && raw.event_type) {
              const event: AgentEvent = {
                id: raw.id || `supa-${Date.now()}`,
                agentId: raw.agent_id,
                eventType: raw.event_type,
                message: raw.message || 'Remote agent event received',
                taskTitle: raw.task_title,
                progress: raw.progress,
                targetLocation: raw.target_location,
                timestamp: raw.created_at || new Date().toISOString()
              };
              handleIncomingEvent(event);
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn('AI Office Supabase Realtime channel setup warning:', err);
    }
  }, [handleIncomingEvent]);

  // Demo Mode Simulation Engine
  useEffect(() => {
    if (!isDemoMode) return;

    const demoScenarios = [
      {
        agentId: 'frontend-01',
        eventType: 'task_progress' as const,
        message: 'Optimized 3D agent raycaster picking and bounding spheres',
        progress: 85,
        targetLocation: 'frontend' as const
      },
      {
        agentId: 'backend-01',
        eventType: 'task_progress' as const,
        message: 'Implemented OCPI 2.2.1 token handshake and connector cache',
        progress: 90,
        targetLocation: 'backend' as const
      },
      {
        agentId: 'tester-01',
        eventType: 'test_started' as const,
        message: 'Running stress tests on concurrent PostGIS geography queries',
        progress: 98,
        targetLocation: 'testing' as const
      },
      {
        agentId: 'database-01',
        eventType: 'agent_thinking' as const,
        message: 'Benchmarking spatial partition bounds for Bali EV hubs',
        progress: 68,
        targetLocation: 'database' as const
      },
      {
        agentId: 'devops-01',
        eventType: 'task_progress' as const,
        message: 'Automated container cluster memory limit verification (<120MB)',
        progress: 92,
        targetLocation: 'devops' as const
      },
      {
        agentId: 'orchestrator-01',
        eventType: 'task_progress' as const,
        message: 'Generated sprint release changelog and security review summary',
        progress: 94,
        targetLocation: 'orchestrator' as const
      },
      {
        agentId: 'backend-01',
        eventType: 'test_started' as const,
        message: 'Moved to Testing Lab to pair with Sentinel Tester on RLS security',
        progress: 92,
        targetLocation: 'testing' as const
      },
      {
        agentId: 'backend-01',
        eventType: 'task_completed' as const,
        message: 'Returned to Backend desk: OCPI 2.2.1 test suite passed with 100% assertions',
        progress: 100,
        targetLocation: 'backend' as const
      }
    ];

    let scenarioIndex = 0;

    const interval = setInterval(() => {
      const scenario = demoScenarios[scenarioIndex % demoScenarios.length];
      scenarioIndex++;

      const event = agentEventAdapter.createEvent(
        scenario.agentId,
        scenario.eventType,
        scenario.message,
        {
          progress: scenario.progress,
          targetLocation: scenario.targetLocation
        }
      );

      handleIncomingEvent(event);
    }, 7000);

    return () => clearInterval(interval);
  }, [isDemoMode, handleIncomingEvent]);

  // Position interpolation loop: moves agents towards targetPosition
  useEffect(() => {
    let animationFrameId: number;

    const updatePositions = () => {
      setAgents((prev) => {
        let hasMoved = false;

        const updated = prev.map((agent) => {
          const [cx, cy, cz] = agent.currentPosition;
          const [tx, ty, tz] = agent.targetPosition;

          const dx = tx - cx;
          const dy = ty - cy;
          const dz = tz - cz;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance > 0.05) {
            hasMoved = true;
            const step = Math.min(0.08, distance * 0.1);
            const ratio = step / distance;
            return {
              ...agent,
              currentPosition: [
                cx + dx * ratio,
                cy + dy * ratio,
                cz + dz * ratio
              ] as [number, number, number]
            };
          }

          return agent;
        });

        return hasMoved ? updated : prev;
      });

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const selectAgent = useCallback((id: string) => {
    setSelectedAgentId(id);
    const agent = agentsRef.current.find((a) => a.id === id);
    if (agent && agent.location) {
      setCameraPreset(agent.location as CameraPreset);
    }
  }, []);

  const triggerManualTask = useCallback(
    (agentId: string, taskTitle: string) => {
      const event = agentEventAdapter.createEvent(
        agentId,
        'task_started',
        `User assigned new task: "${taskTitle}"`,
        { taskTitle, progress: 10 }
      );
      handleIncomingEvent(event);
    },
    [handleIncomingEvent]
  );

  return {
    agents,
    selectedAgent,
    selectedAgentId,
    selectAgent,
    cameraPreset,
    setCameraPreset,
    isDemoMode,
    setIsDemoMode,
    recentEvents,
    triggerManualTask
  };
}
