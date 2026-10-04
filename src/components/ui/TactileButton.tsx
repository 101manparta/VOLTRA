import React from 'react';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm font-medium gap-2 rounded-xl',
    lg: 'px-6 py-3.5 text-base font-semibold gap-2.5 rounded-2xl'
  };

  const variantStyles = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_28px_rgba(16,185,129,0.4)]',
    secondary: 'bg-white hover:bg-slate-100 text-slate-900 font-semibold shadow-md',
    glass: 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border border-white/[0.12] backdrop-blur-md',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 whitespace-nowrap shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
