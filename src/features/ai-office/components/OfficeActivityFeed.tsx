/**
 * VOLTRA AI Office — OfficeActivityFeed Component
 * 
 * Live streaming event feed displaying real-time agent execution events.
 */

import React from 'react';
import { Activity, Bot, CheckCircle2, Clock, Code2, Flame, RotateCw, Server, TestTube2, Zap } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { AgentEvent, AgentEventType } from '../types';

interface OfficeActivityFeedProps {
  events: AgentEvent[];
}

export const OfficeActivityFeed: React.FC<OfficeActivityFeedProps> = ({ events }) => {
  const getEventIcon = (type: AgentEventType) => {
    switch (type) {
      case 'test_started':
      case 'test_completed':
        return <TestTube2 className="w-3.5 h-3.5 text-pink-400" />;
      case 'task_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'task_progress':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'agent_thinking':
        return <Bot className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <GlassCard variant="base" className="p-4 flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          SYSTEM ACTIVITY LOG
        </h4>
        <span className="text-[10px] font-mono text-slate-500">Live Agent Stream</span>
      </div>

      <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center py-4">
            Awaiting agent execution events...
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs font-mono"
            >
              <div className="shrink-0 mt-0.5">{getEventIcon(evt.eventType)}</div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{evt.agentId.replace('-01', '')}</span>
                  <span className="text-[10px] text-slate-500">{evt.timestamp}</span>
                </div>
                <span className="text-slate-400 mt-0.5 line-clamp-1">{evt.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};
