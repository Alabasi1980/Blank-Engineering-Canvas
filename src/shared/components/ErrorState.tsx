
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'حدث خطأ',
  message,
  onRetry,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center p-8 h-full min-h-[200px] text-center ${className}`}>
    <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-sm animate-pulse">
      <AlertTriangle size={32} />
    </div>
    <h3 className="text-lg font-bold text-txt-main mb-2">{title}</h3>
    <p className="text-sm text-txt-muted max-w-sm mb-6 leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="secondary" icon={<RefreshCw size={16} />}>
        إعادة المحاولة
      </Button>
    )}
  </div>
);
