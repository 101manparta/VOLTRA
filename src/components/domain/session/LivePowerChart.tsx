import React from 'react';
import { Activity, AlertTriangle, ArrowDownRight, Zap } from 'lucide-react';
import { TelemetryPoint } from '../../../types/session';
import { GlassCard } from '../../ui/GlassCard';

interface LivePowerChartProps {
  history: TelemetryPoint[];
  currentKw: number;
  hasDeratingAnomaly?: boolean;
  anomalyMessage?: string;
  className?: string;
}

export const LivePowerChart: React.FC<LivePowerChartProps> = ({
  history,
  currentKw,
  hasDeratingAnomaly,
  anomalyMessage,
  className = ''
}) => {
  // Chart dimensions
  const height = 140;
  const width = 480;
  const padding = 20;

  const points = [...history];
  // Calculate min and max
  const maxKw = 70;
  const minKw = 0;

  const getCoordinates = (point: TelemetryPoint, index: number, total: number) => {
    const x = padding + (index / Math.max(total - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((point.powerKw - minKw) / (maxKw - minKw)) * (height - 2 * padding);
    return { x, y };
  };

  const pathD = points.reduce((acc, point, i) => {
    const { x, y } = getCoordinates(point, i, points.length);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`
    : '';

  return (
    <GlassCard variant="base" className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Power Delivery Stability</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-mono font-bold text-white tabular-nums">
              {currentKw.toFixed(1)} <span className="text-sm font-normal text-slate-400">kW</span>
            </span>
            {hasDeratingAnomaly && (
              <span className="flex items-center gap-1 text-xs font-mono text-rose-400 font-semibold animate-pulse">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Derated (-35%)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time Stream</span>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="powerFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hasDeratingAnomaly ? '#f43f5e' : '#10b981'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={hasDeratingAnomaly ? '#f43f5e' : '#10b981'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Guideline for 50 kW standard */}
          <line
            x1={padding}
            y1={height - padding - (50 / maxKw) * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - (50 / maxKw) * (height - 2 * padding)}
            className="stroke-slate-800"
            strokeDasharray="4 4"
          />
          <text
            x={width - padding}
            y={height - padding - (50 / maxKw) * (height - 2 * padding) - 4}
            className="fill-slate-600 font-mono text-[9px]"
            textAnchor="end"
          >
            50 kW Target
          </text>

          {/* Area under curve */}
          {areaD && <path d={areaD} fill="url(#powerFill)" />}

          {/* Line stroke */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={hasDeratingAnomaly ? '#f43f5e' : '#10b981'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => {
            const { x, y } = getCoordinates(p, idx, points.length);
            const isLast = idx === points.length - 1;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={isLast ? 4 : 2.5}
                className={isLast ? (hasDeratingAnomaly ? 'fill-rose-400 stroke-rose-950' : 'fill-emerald-400 stroke-emerald-950') : 'fill-slate-500'}
                strokeWidth={isLast ? 2 : 1}
              />
            );
          })}
        </svg>
      </div>

      {hasDeratingAnomaly && anomalyMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{anomalyMessage}</span>
        </div>
      )}
    </GlassCard>
  );
};
