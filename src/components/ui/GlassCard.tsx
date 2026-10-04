import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'base' | 'elevated' | 'interactive' | 'accent';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'base',
  className = '',
  ...props
}) => {
  const variantStyles = {
    base: 'bg-[#101522]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
    elevated: 'bg-[#141B2D]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.25)]',
    interactive: 'bg-[#101522]/70 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#151C2E]/80 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 shadow-lg',
    accent: 'bg-emerald-950/20 backdrop-blur-xl border border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.06)]'
  };

  return (
    <div
      className={`rounded-2xl ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
