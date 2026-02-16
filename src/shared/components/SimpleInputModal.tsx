
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface SimpleInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
}

export const SimpleInputModal: React.FC<SimpleInputModalProps> = ({
  isOpen, onClose, onSave, title, label, placeholder, initialValue = '', confirmText = 'حفظ'
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md overflow-hidden relative fantasy-appear bg-surface-card border border-border-subtle" onClick={(e) => e.stopPropagation()}>
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary to-primary-500"></div>
        
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-overlay">
          <h3 className="font-bold text-txt-main text-lg tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-txt-muted hover:text-red-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {label && <label className="block text-xs font-black text-txt-muted uppercase tracking-widest">{label}</label>}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-fantasy w-full px-4 py-3 font-bold"
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) {
                onSave(value);
                onClose();
              }
            }}
          />
        </div>
        
        <div className="px-6 py-4 bg-black/20 border-t border-border-subtle flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button onClick={() => { onSave(value); onClose(); }} disabled={!value.trim()}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
};
