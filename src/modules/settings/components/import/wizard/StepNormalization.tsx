
import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, Table, RefreshCw, Download, PlusCircle, AlertCircle } from 'lucide-react';
import { AnalysisStats } from '../../../hooks/useImportWizard';
import { Button } from '../../../../../shared/components/Button';

interface StepAnalysisProps {
    stats: AnalysisStats | null;
    onCommit: () => void;
    onBack: () => void;
    onDownloadRejects: () => void;
    isProcessing: boolean;
}

export const StepNormalization: React.FC<StepAnalysisProps> = ({ stats, onCommit, onBack, onDownloadRejects, isProcessing }) => {
    if (!stats) return null;

    const hasRejects = stats.rejectedDuplicates > 0 || stats.invalidRows > 0;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="glass-card p-8 rounded-[2.5rem] border border-border-subtle shadow-sm relative overflow-hidden bg-surface-card">
                <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>
                
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20"><Activity size={24}/></div>
                        <div>
                            <h3 className="text-xl font-black text-txt-main">المرحلة 4: نتائج التحليل والمطابقة</h3>
                            <p className="text-xs text-txt-secondary">تقرير مقارنة البيانات الواردة مع محتويات الحاوية الحالية.</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard 
                        label="سجلات جديدة" value={stats.newRecords} 
                        icon={PlusCircle} color="emerald" 
                        desc="سيتم إضافتها"
                    />
                    <StatCard 
                        label="سجلات محدثة" value={stats.updatedRecords} 
                        icon={RefreshCw} color="blue" 
                        desc="موجودة وسيتم تعديلها"
                    />
                    <StatCard 
                        label="مطابقة تماماً" value={stats.identicalRecords} 
                        icon={CheckCircle2} color="slate" 
                        desc="لن يتم تغييرها"
                    />
                    <StatCard 
                        label="مرفوضة / مكررة" value={stats.rejectedDuplicates + stats.invalidRows} 
                        icon={ShieldAlert} color="red" 
                        desc="لن يتم استيرادها"
                    />
                </div>

                {/* Rejects Handling */}
                {hasRejects && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={24} className="text-red-400 mt-1" />
                            <div>
                                <h4 className="font-black text-red-200 text-sm">تم رصد بيانات غير مطابقة للدستور</h4>
                                <p className="text-xs text-red-300/80 mt-1">
                                    يوجد {stats.rejectedDuplicates} سجل مكرر و {stats.invalidRows} سجل غير صالح. 
                                    لن يتم إدخال هذه البيانات للنظام. يمكنك تحميلها للمراجعة.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onDownloadRejects}
                            className="flex items-center gap-2 bg-surface-card border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-red-500/10 transition-colors shadow-sm"
                        >
                            <Download size={14} /> تحميل المرفوضات (Excel)
                        </button>
                    </div>
                )}

                {/* Sample Table */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-2">
                        <Table size={14}/> عينة من البيانات المقبولة ({stats.actions.toInsert.length + stats.actions.toUpdate.length})
                    </h4>
                    <div className="border border-border-subtle rounded-2xl overflow-hidden shadow-inner bg-surface-input max-h-[250px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-right text-[10px]">
                            <thead className="bg-surface-overlay text-txt-secondary sticky top-0 font-bold backdrop-blur-md">
                                <tr>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3">التاريخ</th>
                                    <th className="p-3">المبلغ</th>
                                    <th className="p-3">البيان</th>
                                    <th className="p-3">المعرف (PK)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle font-medium text-txt-main">
                                {[...stats.actions.toInsert, ...stats.actions.toUpdate].slice(0, 10).map((row: any, i) => {
                                    const isNew = stats.actions.toInsert.includes(row);
                                    return (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full font-black ${isNew ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                    {isNew ? 'NEW' : 'UPDATE'}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-txt-secondary">{row.date}</td>
                                            <td className="p-3 font-black">{row.amount.toLocaleString()}</td>
                                            <td className="p-3 text-txt-muted truncate max-w-[150px]">{row.description}</td>
                                            <td className="p-3 font-mono text-txt-muted">{row.sourceRef || row.id}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-10 flex justify-between items-center border-t border-border-subtle pt-8">
                    <Button variant="secondary" onClick={onBack} size="lg">رجوع للربط</Button>
                    <div className="flex gap-4">
                        <Button onClick={onCommit} loading={isProcessing} size="lg" className="bg-primary-600 hover:bg-primary-500 px-12 shadow-xl shadow-primary-500/20">
                            اعتماد التغييرات وتثبيت الحزمة
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, desc }: any) => {
    const colors: any = {
        emerald: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20',
        blue: 'bg-blue-500/5 text-blue-400 border-blue-500/20',
        slate: 'bg-slate-500/5 text-slate-400 border-slate-500/20',
        red: 'bg-red-500/5 text-red-400 border-red-500/20',
    };
    return (
        <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col items-center text-center gap-2 transition-all hover:bg-opacity-10`}>
            <Icon size={24} className="opacity-80" />
            <span className="text-2xl font-black">{value}</span>
            <div>
                <span className="block text-[10px] font-black uppercase tracking-wider opacity-70">{label}</span>
                <span className="block text-[9px] opacity-50">{desc}</span>
            </div>
        </div>
    );
};
