
import React from 'react';
import { ArrowRight, ChevronLeft, Eye } from 'lucide-react';

interface EditorHeaderProps {
    onBack: () => void;
    mainCardTitle: string;
    subCardTitle: string;
    onPreview: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onBack, mainCardTitle, subCardTitle, onPreview }) => (
    <div className="bg-surface-overlay/80 backdrop-blur-md border-b border-border-subtle px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3 text-xs text-txt-secondary">
            <button onClick={onBack} className="hover:text-primary-400 flex items-center gap-1 transition-colors font-medium">
                <ArrowRight size={14} />
                <span>رجوع</span>
            </button>
            <span className="text-border-highlight">|</span>
            <span>{mainCardTitle}</span>
            <ChevronLeft size={12} />
            <span className="font-bold text-txt-main text-sm">{subCardTitle}</span>
        </div>
        <button onClick={onPreview} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary-900/20 hover:shadow-primary-500/30 border border-primary-500/50">
            <Eye size={14} />
            معاينة البطاقة
        </button>
    </div>
);
