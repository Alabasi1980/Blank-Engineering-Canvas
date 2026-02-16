
import React from 'react';
import { CreditCard, ChevronLeft, Copy, Trash2, PlusCircle, Layout, Database, Table } from 'lucide-react';
import { SubCard } from '../../../types';
import { CARD_COLORS } from '../../../constants';
import { useCompany } from '../../../context/CompanyContext';
import { EmptyState } from '../../../shared/components/EmptyState';

interface SubCardGridProps {
  subCards: SubCard[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const SubCardGrid: React.FC<SubCardGridProps> = ({ subCards, onSelect, onAdd, onDuplicate, onDelete }) => {
  const { config } = useCompany();
  
  const cards = subCards || [];

  if (cards.length === 0) {
      return (
        <EmptyState 
            icon={Layout}
            title="لوحة القواعد فارغة"
            description="ابدأ بتعريف أول بطاقة ذكية للوحة القيادة الخاصة بك لتتبع المؤشرات."
            className="col-span-full border-2 border-dashed border-border-subtle rounded-3xl bg-surface-card text-txt-muted"
            action={{
                label: 'إنشاء أول بطاقة مؤشر',
                onClick: onAdd,
                icon: <PlusCircle size={20} />
            }}
        />
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map(sub => {
         const theme = CARD_COLORS.find(c => c.value === sub.color) || CARD_COLORS[0];
         const dataSource = config.dataSources.find(ds => ds.id === sub.dataSourceId);
         const schema = config.tableSchemas.find(s => s.id === sub.tableSchemaId);

         return (
          <div 
            key={sub.id}
            className={`glass-card p-6 cursor-pointer transition-all group relative overflow-hidden flex flex-col hover:border-${theme.value}-500/50`}
          >
            {/* Click area */}
            <div className="absolute inset-0 z-0" onClick={() => onSelect(sub.id)}></div>
            <div className={`absolute top-0 right-0 w-1 h-full ${theme.bg} opacity-50 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_10px_currentColor]`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-2.5 rounded-xl shadow-inner bg-surface-input ${theme.text}`}>
                <CreditCard size={24} />
              </div>
              
              <div className="flex gap-1">
                 {onDuplicate && (
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(sub.id); }} className="p-1.5 text-txt-secondary hover:text-primary-400 hover:bg-surface-overlay rounded-lg transition-colors"><Copy size={16} /></button>
                 )}
                 {onDelete && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }} className="p-1.5 text-txt-secondary hover:text-red-400 hover:bg-surface-overlay rounded-lg transition-colors"><Trash2 size={16} /></button>
                 )}
              </div>
            </div>
            
            <div className="relative z-10 flex-1" onClick={() => onSelect(sub.id)}>
                <h3 className="font-bold text-lg text-txt-main mb-1 group-hover:text-txt-onBrand transition-colors">{sub.title}</h3>
                <p className="text-xs text-txt-secondary line-clamp-2 mb-4">{sub.description}</p>
                
                {/* Meta Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-surface-input text-txt-muted border border-border-subtle">
                        <Database size={10} /> {dataSource?.label || 'المصدر الافتراضي'}
                    </span>
                    {schema && (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                            <Table size={10} /> {schema.name}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between text-xs relative z-10" onClick={() => onSelect(sub.id)}>
              <span className="font-black text-txt-muted uppercase tracking-tighter bg-surface-input px-2 py-0.5 rounded">{sub.rules.length} قواعد معالجة</span>
              <span className={`font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 translate-x-2 group-hover:translate-x-0 ${theme.text}`}>
                تعديل التهيئة <ChevronLeft size={14} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
