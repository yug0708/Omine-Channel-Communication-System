import React from 'react';
import ReactDOM from 'react-dom';

export interface FullScreenLoaderProps {
  isLoading: boolean;
  title?: string;
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  isLoading,
  title = 'Processing…',
  message = 'Please wait while the action is being processed',
}) => {
  if (!isLoading || typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm select-none"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-white dark:bg-[#151B25] border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-emerald-500/10 max-w-xs w-full mx-4 text-center">
        <div className="relative flex items-center justify-center">
          {/* Soft ambient glow */}
          <div className="absolute h-16 w-16 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          {/* Outer spinning ring */}
          <div className="h-14 w-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          {/* Inner glowing dot */}
          <div className="absolute h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {message && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FullScreenLoader;
