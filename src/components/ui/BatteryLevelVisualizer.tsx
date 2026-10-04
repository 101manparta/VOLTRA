import React from 'react';
import { Zap } from 'lucide-react';

interface BatteryLevelVisualizerProps {
  currentSoc: number;    // e.g. 67
  targetSoc?: number;    // e.g. 80
  isCharging?: boolean;
  powerKw?: number;      // e.g. 48.2
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BatteryLevelVisualizer: React.FC<BatteryLevelVisualizerProps> = ({
  currentSoc,
  targetSoc = 80,
  isCharging = true,
  powerKw,
  size = 'lg',
  className = ''
}) => {
  const isLarge = size === 'lg';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Precision Circular Battery Meter */}
      <div className="relative flex items-center justify-center w-52 h-52 md:w-64 md:h-64">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Target Arc / Outer guide */}
          <circle
            cx="100"
            cy="100"
            r="82"
            className="stroke-slate-800/80"
            strokeWidth="10"
            fill="transparent"
          />

          {/* Target Threshold Dash */}
          <circle
            cx="100"
            cy="100"
            r="82"
            className="stroke-slate-700/60"
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 82}`}
            strokeDashoffset={`${2 * Math.PI * 82 * (1 - targetSoc / 100)}`}
            fill="transparent"
          />

          {/* Active Level Arc */}
          <circle
            cx="100"
            cy="100"
            r="82"
            className="stroke-emerald-400 transition-all duration-700 ease-out drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]"
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 82}`}
            strokeDashoffset={`${2 * Math.PI * 82 * (1 - currentSoc / 100)}`}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Inner Readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            {isCharging && <Zap className="w-4 h-4 fill-emerald-400 animate-pulse" />}
            <span className="text-[11px] font-mono tracking-widest font-semibold uppercase">
              {isCharging ? 'CHARGING ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-mono font-bold text-5xl md:text-6xl tabular-nums tracking-tight text-white">
              {currentSoc}
            </span>
            <span className="font-mono text-2xl text-slate-400 ml-1">%</span>
          </div>

          {powerKw !== undefined && (
            <div className="mt-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <span className="text-xs font-mono font-medium text-emerald-300 tabular-nums">
                {powerKw.toFixed(1)} kW
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Target {targetSoc}%
          </div>
        </div>
      </div>
    </div>
  );
};
