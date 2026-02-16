
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'جاري التحميل...', 
  className = '',
  fullScreen = false
}) => {
  const baseClasses = "flex flex-col items-center justify-center p-8 text-txt-muted";
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[100] bg-surface-overlay/80 backdrop-blur-md" 
    : `h-full min-h-[200px] ${className}`;

  return (
    <div className={`${baseClasses} ${containerClasses}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-20"></div>
        <div className="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle relative z-10">
            <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      </div>
      <p className="text-sm font-bold mt-4 animate-pulse text-txt-secondary">{message}</p>
    </div>
  );
};
