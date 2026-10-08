/**
 * VOLTRA AI Office — OfficeToolbar Component
 * 
 * Camera presets, agent status counters, and Demo Mode simulation toggles.
 */

import React from 'react';
import {
  Activity,
  Bot,
  Camera,
  CheckCircle2,
  Code2,
  Database,
  Eye,
  Flame,
  Layers,
  Play,
  RotateCcw,
  Server,
  ShieldAlert,
  TestTube2,
  Zap
} from 'lucide-react';
import { AgentState, CameraPreset } from '../types';

interface OfficeToolbarProps {
  agents: AgentState[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const OfficeToolbar: React.FC<OfficeToolbarProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  cameraPreset,
  onSelectCameraPreset,
  isDemoMode,
  onToggleDemoMode
}) => {
  const workingCount = agents.filter((a) => a.status === 'WORKING').length;
  const thinkingCount = agents.filter((a) => a.status === 'THINKING').length;
  const testingCount = agents.filter((a) => a.status === 'TESTING').length;
  const idleCount = agents.filter((a) => a.status === 'IDLE' || a.status === 'WAITING').length;

  const cameraPresets: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'orchestrator', label: 'Orchestrator', icon: <Bot className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'frontend', label: 'Frontend', icon: <Code2 className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'backend', label: 'Backend', icon: <Zap className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'database', label: 'Database', icon: <Database className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'testing', label: 'Testing', icon: <TestTube2 className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'devops', label: 'DevOps', icon: <Server className="w-3.5 h-3.5 text-blue-400" /> }
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Bar: Title, Counters, and Demo Mode Switch */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">AI SOFTWARE OFFICE</h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isDemoMode
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isDemoMode ? 'DEMO MODE: SIMULATING' : 'LIVE EVENT STREAM'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              3D virtual software-engineering workspace visualizing autonomous AI agent lifecycles
            </p>
          </div>
        </div>

        {/* Live Status Counts */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">{workingCount}</span>
            <span className="text-slate-400">Working</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-white font-bold">{thinkingCount}</span>
            <span className="text-slate-400">Thinking</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span className="text-white font-bold">{testingCount}</span>
            <span className="text-slate-400">Testing</span>
          </div>

          <button
            onClick={onToggleDemoMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/[0.05] text-slate-300 border-white/10 hover:bg-white/[0.08]'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isDemoMode ? 'animate-spin' : ''}`} />
            <span>{isDemoMode ? 'Pause Demo' : 'Resume Demo'}</span>
          </button>
        </div>
      </div>

      {/* Camera Presets & Agent Quick Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] backdrop-blur-md">
        {/* Camera Views */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            VIEW:
          </span>
          {cameraPresets.map((preset) => {
            const isActive = cameraPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectCameraPreset(preset.id)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {preset.icon}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Agent Avatars Quick Switch */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-500 mr-1">AGENTS:</span>
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-white/10 text-white font-semibold border border-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
                title={`${agent.name} (${agent.status})`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: agent.avatarColor }}
                />
                <span className="hidden md:inline line-clamp-1">{agent.role.slice(0, 4)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
