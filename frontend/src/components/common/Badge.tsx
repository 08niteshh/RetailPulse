import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-500/10',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/10',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/30 shadow-sm shadow-violet-500/10',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-sm shadow-cyan-500/10',
    neutral: 'bg-white/[0.04] text-slate-300 border-white/[0.08]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2.5 py-0.5 font-mono font-semibold',
    md: 'text-xs px-3 py-1 font-mono font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
