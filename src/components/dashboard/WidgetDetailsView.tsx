
import React, { useState, useMemo } from 'react';
import { X, Calculator, Settings2, Eye, XCircle, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { ProcessedTransactionDetail } from '../../core/logic/MetricCalculator';
import { useLabelResolver } from '../../hooks/useLabelResolver';
import { TransactionInspector } from './TransactionInspector';
import { SchemaService } from '../../core/services/SchemaService';
import { useMasterDataStore } from '../../context/MasterDataStoreContext';
import { EmptyState } from '../../shared/components/EmptyState';
import { useData } from '../../core/context/DataContext';
import { useModal } from '../../context/ModalContext';

interface WidgetDetailsViewProps {
  data: ProcessedTransactionDetail[];
  totalValue: number;
  currencySymbol: string;
  externalFilter?: { field: string, value: string } | null;
  onClearExternalFilter?: () => void;
  rules?: any[]; 
}

export const WidgetDetailsView: React.FC<WidgetDetailsViewProps> = ({ 
    data, 
    totalValue, 
    currencySymbol, 
    externalFilter,
    onClearExternalFilter,
    rules = []
}) => {
  const { config } = useCompany();
  const { deleteTransaction } = useData();
  const { confirm } = useModal();
  const { allMasterData } = useMasterDataStore();
  const { resolveLabel } = useLabelResolver();
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const displayColumns = useMemo(() => {
      const coreCols = [
          { id: 'date', label: 'التاريخ', width: '12%' },
          { id: 'description', label: 'البيان', width: '20%' }
      ];

      const dimCols = (config.dimensionsRegistry || [])
          .filter(d => d.enabled && d.ui.pivot)
          .slice(0, 3)
          .map(d => ({ id: d.id, label: d.label, width: '15%' }));

      return [...coreCols, ...dimCols];
  }, [config.dimensionsRegistry]);

  const filteredDetailsData = useMemo(() => {
      return data.filter(item => {
          const tx = item.transaction;
          if (externalFilter) {
              const dimId = externalFilter.field;
              const actualValue = SchemaService.getValue(tx, dimId, config); 
              const actualLabel = SchemaService.getLabel(config, allMasterData as any, dimId, actualValue);
              if (actualLabel !== externalFilter.value) return false;
          }
          if (searchTerm) {
              const term = searchTerm.toLowerCase();
              const searchableText = [
                  tx.description || '', 
                  tx.sourceRef || '',
                  ...displayColumns.map(col => {
                      const val = SchemaService.getValue(tx, col.id, config);
                      return SchemaService.getLabel(config, allMasterData as any, col.id, val);
                  })
              ].join(' ').toLowerCase();
              
              if (!searchableText.includes(term)) return false;
          }
          return true;
      });
  }, [data, searchTerm, externalFilter, config, allMasterData, displayColumns]);

  const handleDeleteRow = async (e: React.MouseEvent, item: ProcessedTransactionDetail) => {
      e.stopPropagation();
      if (await confirm({
          title: 'حذف حركة واحدة',
          message: `هل أنت متأكد من حذف الحركة؟ سيتم تحديث الرقم الإجمالي للبطاقة فوراً.`,
          variant: 'danger',
          confirmText: 'حذف الحركة'
      })) {
          const sourceId = item.ruleId.split('_')[0]; 
          const possibleSources = config.dataSources.map(s => s.id);
          const actualSource = possibleSources.find(id => item.transaction.id.includes(id)) || possibleSources[0];
          
          await deleteTransaction(actualSource, item.transaction.id);
      }
  };

  return (
    <div className="flex-1 flex overflow-hidden font-sans relative flex-col">
        <div className="flex-1 flex flex-col min-w-0">
            {externalFilter && (
                <div className="bg-primary-900/20 backdrop-blur-md px-6 py-2 flex items-center gap-3 shadow-lg z-20 shrink-0 border-b border-primary-500/30">
                    <Settings2 size={16} className="text-primary-300" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">تصفية رسومية: {externalFilter.value}</span>
                    <button onClick={onClearExternalFilter} className="mr-auto text-white hover:bg-white/10 p-1 rounded-full"><X size={14}/></button>
                </div>
            )}

            <div className="flex items-center bg-surface-overlay/80 backdrop-blur-md text-txt-secondary font-black text-[10px] uppercase tracking-wider px-6 shrink-0 border-b border-border-subtle relative z-10">
                {displayColumns.map(col => (
                    <div key={col.id} style={{ width: col.width }} className="py-4 pr-2">{col.label}</div>
                ))}
                <div className="w-[15%] py-4 text-left bg-blue-500/10 text-blue-300 px-2 ml-auto">قيمة المحرك</div>
                <div className="w-[12%] py-4 text-center">إجراءات</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredDetailsData.length > 0 ? (
                    filteredDetailsData.map((item, idx) => {
                        const tx = item.transaction;
                        const isModified = Math.abs(item.calculatedValue) !== tx.amount;
                        const isSelected = selectedTx?.id === tx.id;
                        
                        return (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedTx(tx)}
                                className={`flex items-center text-xs border-b border-border-subtle hover:bg-surface-overlay transition-colors px-6 group cursor-pointer ${isSelected ? 'bg-primary-500/10 border-primary-500/30' : ''}`}
                            >
                                {displayColumns.map(col => {
                                    const rawVal = SchemaService.getValue(tx, col.id, config);
                                    const displayVal = SchemaService.getLabel(config, allMasterData as any, col.id, rawVal);
                                    return (
                                        <div key={col.id} style={{ width: col.width }} className="py-4 pr-2 truncate text-txt-secondary font-medium" title={displayVal}>
                                            {displayVal}
                                        </div>
                                    );
                                })}
                                
                                <div className="w-[15%] py-4 text-left font-black text-txt-main tabular-nums text-sm bg-surface-input px-2 group-hover:bg-surface-overlay transition-colors ml-auto">
                                    {item.calculatedValue.toLocaleString()}
                                    {isModified && (
                                        <span className="block text-[9px] text-amber-400 font-bold" title="تم تعديل القيمة بواسطة المحرك">الأصل: {tx.amount.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="w-[12%] py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button className="p-1.5 text-txt-muted hover:text-blue-400 hover:bg-surface-input rounded transition-colors" title="فحص منطق المعالجة">
                                            <Eye size={14} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteRow(e, item)}
                                            className="p-1.5 text-txt-muted hover:text-red-400 hover:bg-surface-input rounded transition-colors" 
                                            title="حذف هذه الحركة"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <EmptyState 
                        icon={XCircle}
                        title="لا توجد حركات"
                        description="لم يتم العثور على حركات مالية تطابق القواعد أو الفلاتر المحددة حالياً."
                        className="py-12 text-txt-muted"
                    />
                )}
            </div>

            <div className="bg-surface-overlay border-t border-border-subtle px-8 py-5 flex justify-between items-center shrink-0 backdrop-blur-md">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">إجمالي السجلات</span>
                        <span className="font-black text-txt-main">{filteredDetailsData.length.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                        <Calculator size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">صافي ناتج المحرك (Engine Output)</span>
                    </div>
                    <div className="text-3xl font-black text-txt-main tabular-nums">
                        {filteredDetailsData.reduce((s,i) => s + i.calculatedValue, 0).toLocaleString()}
                        <span className="text-sm font-bold text-txt-muted mr-2">{currencySymbol}</span>
                    </div>
                </div>
            </div>
        </div>

        {selectedTx && (
            <TransactionInspector 
                transaction={selectedTx}
                rules={rules}
                onClose={() => setSelectedTx(null)}
            />
        )}
    </div>
  );
};
