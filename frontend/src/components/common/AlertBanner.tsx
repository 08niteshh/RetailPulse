import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  onClose?: () => void;
  count?: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  title,
  message,
  onClose,
  count,
}) => {
  const styles = {
    CRITICAL: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-200 shadow-lg shadow-rose-500/10',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />,
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    WARNING: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-lg shadow-amber-500/10',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    INFO: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-200 shadow-lg shadow-blue-500/10',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    SUCCESS: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-lg shadow-emerald-500/10',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
  }[type];

  return (
    <div className={`flex items-start justify-between p-4 rounded-2xl border ${styles.bg} backdrop-blur-xl transition-all duration-200`}>
      <div className="flex items-start gap-3.5">
        {styles.icon}
        <div>
          <div className="flex items-center gap-2.5">
            <h4 className="text-sm font-bold text-white font-display">{title}</h4>
            {count !== undefined && count > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles.badge} font-mono font-semibold`}>
                {count} items
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
