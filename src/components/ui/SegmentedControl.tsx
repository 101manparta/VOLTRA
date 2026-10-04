import React from 'react';

interface Option {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm'
  };

  const itemSizeStyles = {
    sm: 'px-2.5 py-1',
    md: 'px-3.5 py-1.5'
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-slate-900/80 border border-white/[0.08] backdrop-blur-md rounded-xl ${sizeStyles[size]} ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 whitespace-nowrap select-none ${itemSizeStyles[size]} ${
              isActive
                ? 'bg-white/[0.14] text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
