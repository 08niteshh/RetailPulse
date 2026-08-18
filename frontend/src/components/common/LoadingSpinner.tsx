import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; fullPage?: boolean }> = ({
  message = 'Processing analytical computations...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <div className="absolute inset-0 w-10 h-10 rounded-full bg-emerald-500/20 blur-md animate-pulse"></div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};
