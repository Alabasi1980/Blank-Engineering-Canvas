
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'نعم، متابعة',
  cancelText = 'إلغاء',
  variant = 'info',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: { icon: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', btn: 'danger' as const },
    warning: { icon: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', btn: 'warning' as const },
    info: { icon: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', btn: 'primary' as const },
  };

  const theme = colors[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card bg-surface-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 opacity-100 transition-all border border-border-subtle">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${theme.bg}`}>
              {variant === 'danger' ? <AlertTriangle className={theme.icon} size={24} /> : 
               variant === 'warning' ? <AlertTriangle className={theme.icon} size={24} /> :
               <Info className={theme.icon} size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-txt-main mb-2">{title}</h3>
              <p className="text-sm text-txt-secondary leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-overlay px-6 py-4 flex justify-end gap-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button 
            variant={theme.btn} 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
