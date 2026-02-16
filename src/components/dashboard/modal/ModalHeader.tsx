
import React from 'react';
import { X, Calendar, PieChart, FileSpreadsheet } from 'lucide-react';

interface ModalHeaderProps {
    title: string;
    selectedDate: Date;
    matchCount: number;
    theme: any;
    onExport: () => void;
    onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, selectedDate, matchCount, theme, onExport, onClose }) => (
    <div className="flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-surface-overlay shrink-0">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.bg} text-white shadow-sm ring-4 ring-offset-2 ring-offset-transparent ${theme.ring}`}>
                <PieChart size={20} />
            </div>
            <div>
                <h3 className="text-lg font-black text-txt-main leading-tight">{title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-txt-muted font-bold mt-0.5 uppercase tracking-wider">
                    <Calendar size={12} />
                    <span>فترة: {selectedDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-txt-muted"></span>
                    <span className="text-primary-400">{matchCount} حركة مطابقة</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={onExport} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-input border border-border-subtle text-txt-secondary hover:text-txt-main hover:bg-surface-card font-black text-xs transition-all shadow-sm active:scale-95 group"
                title="تصدير تقرير رسمي منسق"
            >
                <FileSpreadsheet size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>تصدير Excel</span>
            </button>
            <div className="h-6 w-px bg-border-subtle mx-2"></div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-txt-muted hover:text-red-400 transition-all border border-transparent hover:border-red-500/20">
                <X size={20} />
            </button>
        </div>
    </div>
);
