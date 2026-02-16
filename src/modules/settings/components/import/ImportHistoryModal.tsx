
import React from 'react';
import { X, History, Trash2, FileText, Calendar, Database, AlertTriangle } from 'lucide-react';
import { DataSourceConfigItem, ImportBatch } from '../../../../types';
import { Button } from '../../../../shared/components/Button';
import { useData } from '../../../../core/context/DataContext';
import { useModal } from '../../../../context/ModalContext';

interface ImportHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: DataSourceConfigItem;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ isOpen, onClose, source }) => {
    const { deleteBatch } = useData();
    const { confirm } = useModal();

    if (!isOpen) return null;

    const history = source.importHistory || [];

    const handleDeleteBatch = async (batch: ImportBatch) => {
        if (await confirm({
            title: 'حذف حزمة بيانات',
            message: `هل أنت متأكد من حذف الحزمة "${batch.id}" المستوردة من ملف "${batch.fileName}"؟ سيتم إزالة ${batch.rowCount} سجل من المستودع فوراً.`,
            variant: 'danger',
            confirmText: 'تأكيد الحذف التراجعي'
        })) {
            await deleteBatch(source.id, batch.id);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-2xl overflow-hidden border border-border-subtle flex flex-col max-h-[80vh] bg-surface-card shadow-2xl">
                <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center bg-surface-overlay">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                            <History size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-txt-main">سجل الاستيراد: {source.label}</h3>
                            <p className="text-xs text-txt-secondary">إدارة الحزم والتحكم التراجعي في البيانات.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-txt-muted hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-txt-muted">
                            <History size={64} className="opacity-10 mb-4" />
                            <p className="font-bold text-lg">لا يوجد سجل استيراد لهذا المصدر</p>
                            <p className="text-xs">سيتم تسجيل كل عملية رفع ملف جديدة هنا تلقائياً.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 items-start mb-6">
                                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-400 leading-relaxed font-bold">
                                    تنبيه: حذف حزمة قديمة قد يؤثر على توازن الأرصدة التراكمية. تأكد من أنك تحذف الحزمة الصحيحة بناءً على تاريخ الرفع وعدد السطور.
                                </p>
                            </div>

                            {history.map((batch) => (
                                <div key={batch.id} className="group bg-surface-input border border-border-subtle hover:border-blue-500/30 p-5 rounded-3xl transition-all hover:shadow-lg flex items-center justify-between gap-6 hover:bg-surface-overlay">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="p-3 bg-surface-card text-txt-muted rounded-2xl group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-txt-main truncate text-sm" dir="ltr">{batch.fileName}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] text-txt-secondary font-bold">
                                                    <Calendar size={12}/> {new Date(batch.importedAt).toLocaleDateString('ar-SA')}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-blue-400 font-black">
                                                    <Database size={12}/> {batch.rowCount} سجل
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <code className="text-[9px] font-mono bg-black/20 px-2 py-1 rounded text-txt-muted uppercase border border-border-subtle">ID: {batch.id}</code>
                                        <button 
                                            onClick={() => handleDeleteBatch(batch)}
                                            className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl"
                                        >
                                            <Trash2 size={12}/> حذف الحزمة
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 bg-surface-overlay border-t border-border-subtle flex justify-end">
                    <Button onClick={onClose}>إغلاق السجل</Button>
                </div>
            </div>
        </div>
    );
};
