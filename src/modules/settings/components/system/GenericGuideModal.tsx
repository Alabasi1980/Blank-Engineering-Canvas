
import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';

interface GenericGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GenericGuideModal: React.FC<GenericGuideModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="glass-card bg-surface-card rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-border-subtle flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-6 border-b border-border-subtle bg-surface-overlay flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-txt-muted mb-2">
                            <BookOpen size={20} className="text-blue-400" />
                            <span className="text-xs font-black uppercase tracking-wider">دليل المعرفة</span>
                        </div>
                        <h2 className="text-2xl font-black text-txt-main">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-surface-input hover:bg-surface-overlay text-txt-muted hover:text-red-400 rounded-xl transition-colors shadow-sm border border-border-subtle">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 text-txt-secondary leading-relaxed bg-surface-app/50">
                    {children}
                </div>
                <div className="p-6 bg-surface-overlay border-t border-border-subtle flex justify-end">
                    <Button onClick={onClose} size="lg">فهمت، شكراً</Button>
                </div>
            </div>
        </div>
    );
};
