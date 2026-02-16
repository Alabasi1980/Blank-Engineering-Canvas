
import React from 'react';

interface ProgressBarProps {
  progress?: number; // 0 to 100
  indeterminate?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress = 0, 
  indeterminate = false, 
  label,
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-txt-secondary">{label}</span>
            {!indeterminate && <span className="text-[10px] font-mono text-txt-muted">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-surface-input border border-border-subtle rounded-full overflow-hidden relative">
        <div 
            className={`h-full bg-primary-500 rounded-full transition-all duration-300 shadow-[0_0_10px_var(--color-primary-glow)] ${
                indeterminate ? 'w-1/3 absolute top-0 left-0 animate-progress-indeterminate' : ''
            }`}
            style={!indeterminate ? { width: `${Math.min(100, Math.max(0, progress))}%` } : {}}
        ></div>
      </div>
      <style>{`
        @keyframes progress-indeterminate {
          0% { left: -35%; }
          100% { left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};
