
import React, { useState } from 'react';
import { Camera, History, X, ChevronDown, Trash2, Clock, ShieldCheck, Zap } from 'lucide-react';
import { useSnapshots } from '../../../context/SnapshotContext';
import { useDashboardFilters } from '../../../core/context/DashboardFiltersContext';
import { useCompany } from '../../../context/CompanyContext';
import { Button } from '../../../shared/components/Button';

export const SnapshotToolbar: React.FC<{ dashboardId: string }> = ({ dashboardId }) => {
    const { snapshots, takeSnapshot, viewSnapshot, activeSnapshotId, isSnapshotMode, deleteSnapshot } = useSnapshots();
    const { filters } = useDashboardFilters();
    const { config } = useCompany();
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const handleCapture = async () => {
        // Logic to "Freeze" current dashboard results
        // This is a simplified version - in a real app we'd gather data from all cards via ref/context
        const snapshotName = prompt('أدخل مسمى للقطة (مثلاً: إغلاق الربع الأول)');
        if (!snapshotName) return;

        await takeSnapshot({
            dashboardId,
            name: snapshotName,
            capturedBy: config.branding.systemUser,
            periodLabel: `${filters.dateFrom} ↔ ${filters.dateTo}`,
            filtersApplied: filters,
            metrics: [] // Real values would be captured here by the MetricEngine
        });
    };

    const activeSnapshot = snapshots.find(s => s.id === activeSnapshotId);

    return (
        <div className="flex items-center gap-2 no-print">
            {isSnapshotMode && (
                <div className="flex items-center gap-3 bg-amber-500/20 text-amber-200 px-4 py-2 rounded-2xl shadow-lg animate-pulse border border-amber-500/40">
                    <History size={16} />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none text-amber-400">عرض لقطة مؤرشفة</span>
                        <span className="text-xs font-bold">{activeSnapshot?.name}</span>
                    </div>
                    <button onClick={() => viewSnapshot(null)} className="p-1 hover:bg-white/20 rounded-full text-amber-200 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="relative">
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2.5 rounded-xl border transition-all ${showHistory ? 'bg-surface-card border-border-highlight text-txt-main shadow-xl' : 'bg-surface-input border-border-subtle text-txt-muted hover:bg-surface-overlay'}`}
                    title="سجل اللقطات التاريخية"
                >
                    <History size={20} />
                </button>

                {showHistory && (
                    <div className="absolute top-full left-0 mt-3 w-80 glass-card rounded-3xl shadow-2xl border border-border-highlight z-[100] animate-fade-in-up overflow-hidden bg-surface-card">
                        <div className="p-5 bg-surface-overlay text-txt-main flex justify-between items-center border-b border-border-subtle">
                            <span className="text-xs font-black uppercase tracking-widest">أرشيف التقارير المجمّدة</span>
                            <ShieldCheck size={16} className="text-blue-400" />
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar bg-surface-app/50">
                            {snapshots.length === 0 ? (
                                <div className="py-10 text-center text-txt-muted italic text-sm">لا توجد لقطات محفوظة</div>
                            ) : (
                                snapshots.map(snap => (
                                    <div key={snap.id} className="group p-3 rounded-2xl hover:bg-surface-overlay transition-all flex items-center justify-between border border-transparent hover:border-border-subtle">
                                        <div 
                                            className="flex-1 cursor-pointer"
                                            onClick={() => { viewSnapshot(snap.id); setShowHistory(false); }}
                                        >
                                            <div className="text-xs font-black text-txt-main">{snap.name}</div>
                                            <div className="flex items-center gap-2 mt-1 text-[9px] text-txt-muted font-bold">
                                                <Clock size={10} />
                                                {new Date(snap.capturedAt).toLocaleDateString('ar-SA')}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => deleteSnapshot(snap.id)}
                                            className="p-2 text-txt-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-surface-overlay border-t border-border-subtle">
                            <button 
                                onClick={handleCapture}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black hover:bg-primary-500 shadow-lg transition-all active:scale-95 shadow-primary-500/20"
                            >
                                <Camera size={16} /> تجميد الحالة الحالية
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
