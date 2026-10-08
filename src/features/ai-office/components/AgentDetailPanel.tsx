/**
 * VOLTRA AI Office — AgentDetailPanel Component
 * 
 * Deep inspection panel for selected AI Software Engineering agent:
 * Role, Status, Live Task, Progress, Activity Log, and Metrics.
 */

import React, { useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Focus,
  MapPin,
  Play,
  RotateCw,
  Send,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { TactileButton } from '../../../components/ui/TactileButton';
import { OFFICE_ZONES } from '../data/initialAgents';
import { AgentState, CameraPreset } from '../types';

interface AgentDetailPanelProps {
  agent: AgentState;
  onFocusCamera: (preset: CameraPreset) => void;
  onAssignTask: (agentId: string, taskTitle: string) => void;
}

export const AgentDetailPanel: React.FC<AgentDetailPanelProps> = ({
  agent,
  onFocusCamera,
  onAssignTask
}) => {
  const [customTask, setCustomTask] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const zone = OFFICE_ZONES[agent.location] || OFFICE_ZONES.orchestrator;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTask.trim()) return;
    onAssignTask(agent.id, customTask.trim());
    setCustomTask('');
    setIsAssigning(false);
  };

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'WORKING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            WORKING
          </span>
        );
      case 'THINKING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            THINKING
          </span>
        );
      case 'TESTING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/30">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            TESTING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'ERROR':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            ERROR
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            IDLE
          </span>
        );
    }
  };

  return (
    <GlassCard variant="elevated" className="p-5 flex flex-col gap-5 w-full">
      {/* Header: Agent Identity */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${agent.avatarColor}, ${agent.secondaryColor})`,
              boxShadow: `0 0 20px ${agent.avatarColor}40`
            }}
          >
            <Bot className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono">{agent.name}</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans">{agent.title}</p>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Current Task & Live Progress */}
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            CURRENT TASK
          </span>
          <span className="text-white font-bold tabular-nums">{agent.progress}%</span>
        </div>
        <p className="text-sm text-slate-200 font-medium leading-relaxed">{agent.task}</p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${agent.progress}%`,
              backgroundColor: agent.avatarColor,
              boxShadow: `0 0 10px ${agent.avatarColor}`
            }}
          />
        </div>
      </div>

      {/* Office Location & Camera Quick Focus */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-400 uppercase">ZONE</span>
            <span className="text-xs font-bold text-white">{zone.label}</span>
          </div>
        </div>
        <button
          onClick={() => onFocusCamera(agent.location as CameraPreset)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] transition-colors"
        >
          <Focus className="w-3.5 h-3.5" />
          <span>Focus 3D</span>
        </button>
      </div>

      {/* Activity Log Checklist */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          RECENT ACTIVITY
        </span>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {agent.activityLog.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs font-mono"
            >
              {act.type === 'done' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : act.type === 'active' ? (
                <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 flex flex-col">
                <span className="text-slate-200">{act.message}</span>
                <span className="text-[10px] text-slate-500">{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.08] text-center">
        <div className="flex flex-col p-2 rounded-lg bg-white/[0.02]">
          <span className="text-base font-mono font-bold text-white">{agent.metrics.tasksCompleted}</span>
          <span className="text-[10px] font-mono text-slate-400">Tasks Done</span>
        </div>
        <div className="flex flex-col p-2 rounded-lg bg-white/[0.02]">
          <span className="text-base font-mono font-bold text-emerald-400">
            {agent.metrics.testPassRate ? `${agent.metrics.testPassRate}%` : `${(agent.metrics.linesOfCode ?? 0) / 1000}k`}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {agent.metrics.testPassRate ? 'Pass Rate' : 'Code Lines'}
          </span>
        </div>
        <div className="flex flex-col p-2 rounded-lg bg-white/[0.02]">
          <span className="text-base font-mono font-bold text-cyan-400">{agent.metrics.uptime}</span>
          <span className="text-[10px] font-mono text-slate-400">SRE Uptime</span>
        </div>
      </div>

      {/* Assign Task Action */}
      <div className="pt-2">
        {isAssigning ? (
          <form onSubmit={handleTaskSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder={`Assign new task to ${agent.name}...`}
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAssigning(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                Dispatch
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAssigning(true)}
            className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dispatch Custom Sprint Task</span>
          </button>
        )}
      </div>
    </GlassCard>
  );
};
