import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  height?: string;
  className?: string;
  tooltipText?: string;
  tag?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  height = 'h-80',
  className = '',
  tooltipText,
  tag,
}) => {
  return (
    <div className={`glass-panel p-6 rounded-2xl relative flex flex-col transition-all duration-300 ${className}`}>
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-base text-white tracking-tight font-display">
              {title}
            </h3>
            {tag && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-semibold">
                {tag}
              </span>
            )}
            {tooltipText && (
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-300 cursor-pointer transition-colors" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30 w-60 p-2.5 text-xs bg-[#0b1026] text-slate-200 rounded-xl border border-white/[0.12] shadow-2xl backdrop-blur-xl">
                  {tooltipText}
                </div>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      <div className={`w-full ${height} flex-1 relative z-10`}>{children}</div>
    </div>
  );
};
