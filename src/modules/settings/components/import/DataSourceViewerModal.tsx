
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Download, Database, Loader2 } from 'lucide-react';
import { DataSourceConfigItem, Transaction } from '../../../../types';
import { useData } from '../../../../core/context/DataContext';
import { Button } from '../../../../shared/components/Button';
import { useLabelResolver } from '../../../../hooks/useLabelResolver';
import { LoadingState } from '../../../../shared/components/LoadingState';
import * as XLSX from 'xlsx';
import { useCompany } from '../../../../context/CompanyContext';

interface DataSourceViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: DataSourceConfigItem;
}

export const DataSourceViewerModal: React.FC<DataSourceViewerModalProps> = ({ isOpen, onClose, source }) => {
    const { datasets } = useData();
    const { config } = useCompany(); 
    const { resolveLabel } = useLabelResolver();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<Transaction[]>([]);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setTimeout(() => {
                const sourceData = datasets[source.id] || [];
                setData(sourceData);
                setIsLoading(false);
            }, 300);
        }
    }, [isOpen, source.id, datasets]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data.slice(0, 100);
        const term = searchTerm.toLowerCase();
        return data.filter(row => 
            row.description?.toLowerCase().includes(term) ||
            row.sourceRef?.toLowerCase().includes(term) ||
            row.id.toLowerCase().includes(term)
        ).slice(0, 100);
    }, [data, searchTerm]);

    const dynamicColumns = useMemo(() => {
        return (config.dimensionsRegistry || []).filter(d => 
            d.enabled && !['date', 'amount', 'description', 'sourceRef'].includes(d.id)
        );
    }, [config.dimensionsRegistry]);

    const handleDownload = () => {
        const exportData = data.map(row => {
            const flat: any = {
                'ID': row.id,
                'Date': row.date,
                'Amount': row.amount,
                'Description': row.description,
                'Reference': row.sourceRef,
            };
            dynamicColumns.forEach(dim => {
                const val = row.attributes?.[dim.id];
                flat[dim.label] = resolveLabel(dim.id, val);
            });
            return flat;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `Data_${source.label}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden bg-surface-card border border-border-subtle shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-8 py-6 border-b border-border-subtle bg-surface-overlay flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-txt-main">{source.label}</h3>
                            <p className="text-xs text-txt-secondary font-medium">معاينة محتويات الحاوية ({data.length.toLocaleString()} سجل)</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleDownload} variant="secondary" icon={<Download size={16}/>} className="text-xs">تصدير Excel</Button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-txt-muted hover:text-red-400">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-3 bg-black/20 border-b border-border-subtle flex gap-4 items-center shrink-0">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-txt-muted" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="بحث سريع في الوصف، المرجع، أو المعرف..."
                            className="input-fantasy w-full pr-10 pl-4 py-2 font-bold text-xs"
                        />
                    </div>
                    <div className="text-[10px] text-txt-muted font-bold opacity-70">
                        يتم عرض أول 100 نتيجة فقط للأداء. استخدم التصدير للحصول على الكل.
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-surface-app/50 p-6">
                    {isLoading ? (
                        <LoadingState message="جاري تحميل البيانات..." />
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-txt-muted">
                            <Database size={64} className="opacity-10 mb-4" />
                            <p className="font-bold">الحاوية فارغة</p>
                        </div>
                    ) : (
                        <div className="border border-border-subtle rounded-2xl overflow-hidden shadow-lg bg-surface-card">
                            <table className="w-full text-right text-xs whitespace-nowrap">
                                <thead className="bg-surface-overlay text-txt-secondary font-black sticky top-0 shadow-sm z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="px-6 py-4 border-b border-border-subtle">المعرف (ID)</th>
                                        <th className="px-6 py-4 border-b border-border-subtle">التاريخ</th>
                                        <th className="px-6 py-4 border-b border-border-subtle">المبلغ</th>
                                        <th className="px-6 py-4 border-b border-border-subtle">البيان</th>
                                        <th className="px-6 py-4 border-b border-border-subtle">المرجع</th>
                                        {dynamicColumns.map(dim => (
                                            <th key={dim.id} className="px-6 py-4 text-blue-400 border-b border-border-subtle">{dim.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-txt-main">
                                    {filteredData.map((row) => (
                                        <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-3 font-mono text-txt-muted group-hover:text-txt-secondary">{row.id.slice(0, 8)}...</td>
                                            <td className="px-6 py-3 font-medium text-txt-secondary">{row.date}</td>
                                            <td className="px-6 py-3 font-black text-txt-main tabular-nums">{row.amount.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-txt-secondary truncate max-w-[200px]" title={row.description}>{row.description || '-'}</td>
                                            <td className="px-6 py-3 font-mono text-blue-400">{row.sourceRef || '-'}</td>
                                            {dynamicColumns.map(dim => (
                                                <td key={dim.id} className="px-6 py-3 text-txt-secondary">
                                                    {resolveLabel(dim.id, row.attributes?.[dim.id])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
