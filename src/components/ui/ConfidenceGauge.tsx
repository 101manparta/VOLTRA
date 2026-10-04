import React from 'react';

interface ConfidenceGaugeProps {
  score: number; // 0 - 100
  size?: number; // pixel diameter
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  score,
  size = 54,
  strokeWidth = 4.5,
  showLabel = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let colorClass = 'text-emerald-400 stroke-emerald-400';
  let tierLabel = 'HIGH';
  if (score < 70) {
    colorClass = 'text-rose-400 stroke-rose-400';
    tierLabel = 'RISK';
  } else if (score < 85) {
    colorClass = 'text-amber-400 stroke-amber-400';
    tierLabel = 'MODERATE';
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-700 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute font-mono font-bold text-xs tabular-nums text-slate-100">
          {score}%
        </span>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400">
            {tierLabel} CONFIDENCE
          </span>
          <span className="text-xs font-medium text-slate-200">
            Charging Confidence
          </span>
        </div>
      )}
    </div>
  );
};
