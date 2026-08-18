import React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { KPICardData } from '../../types';

interface KPICardProps {
  data?: KPICardData;
  icon?: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  accentColor?: 'blue' | 'emerald' | 'violet' | 'cyan' | 'amber' | 'rose';
}

export const KPICard: React.FC<KPICardProps> = ({
  data,
  icon,
  subtitle,
  loading,
  accentColor = 'blue'
}) => {
  if (loading || !data) {
    return (
      <div className="glass-panel p-6 animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-3.5 bg-white/10 rounded-md w-28"></div>
          <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
        </div>
        <div className="h-9 bg-white/10 rounded-lg w-40"></div>
        <div className="h-4 bg-white/5 rounded-md w-32"></div>
      </div>
    );
  }

  const { title, formatted_value, percentage_change, is_positive, previous_value, prefix } = data;

  const colorStyles = {
    blue: {
      glow: 'hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      pill: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      spark: '#3b82f6',
    },
    emerald: {
      glow: 'hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      spark: '#10b981',
    },
    violet: {
      glow: 'hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] hover:border-violet-500/40',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      pill: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      spark: '#8b5cf6',
    },
    cyan: {
      glow: 'hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)] hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      pill: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      spark: '#06b6d4',
    },
    amber: {
      glow: 'hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)] hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      spark: '#f59e0b',
    },
    rose: {
      glow: 'hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)] hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      pill: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      spark: '#f43f5e',
    },
  }[accentColor];

  return (
    <div className={`glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${colorStyles.glow}`}>
      {/* Ambient background subtle radial light */}
      <div 
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: colorStyles.spark }}
      />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          {title}
        </span>
        {icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles.iconBg} shadow-inner transition-transform duration-300 hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-1 flex items-baseline justify-between relative z-10">
        <div className="text-3xl font-extrabold text-white tracking-tight font-display">
          {formatted_value}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-2">
          {percentage_change === 0 ? (
            <span className="flex items-center text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg text-[11px] font-mono">
              <Minus className="w-3 h-3 mr-1" /> 0.0%
            </span>
          ) : is_positive ? (
            <span className="flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold shadow-sm shadow-emerald-500/10">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              +{percentage_change}%
            </span>
          ) : (
            <span className="flex items-center text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold shadow-sm shadow-rose-500/10">
              <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-400" />
              {percentage_change}%
            </span>
          )}
          <span className="text-slate-400 text-[11px]">
            vs prior period
          </span>
        </div>

        {subtitle && (
          <span className="text-slate-400 text-[11px] font-mono truncate max-w-[130px]">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
