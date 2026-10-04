import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  unit,
  trend,
  subtext,
  size = 'md',
  className = ''
}) => {
  const valueSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{label}</span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className={`font-mono font-semibold text-slate-100 tabular-nums tracking-tight ${valueSizes[size]}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
        {trend && (
          <span className="ml-1.5 text-xs font-mono font-medium text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      {subtext && <span className="text-xs text-slate-500 mt-0.5">{subtext}</span>}
    </div>
  );
};
