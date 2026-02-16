
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px] ${className}`}>
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-primary-500/20 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
        <div className="w-20 h-20 bg-surface-input border-2 border-dashed border-border-subtle rounded-full flex items-center justify-center relative z-10 group-hover:border-primary-500/50 group-hover:scale-105 transition-all duration-300">
          <Icon size={32} className="text-txt-muted group-hover:text-primary-400 transition-colors" />
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-txt-main mb-2">{title}</h3>
      <p className="text-sm text-txt-secondary max-w-xs leading-relaxed mb-6 mx-auto">
        {description}
      </p>

      {action && (
        <button 
          onClick={action.onClick}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
};
