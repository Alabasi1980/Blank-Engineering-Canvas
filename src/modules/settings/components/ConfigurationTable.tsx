
import React, { useMemo, useRef, useState } from 'react';
import { Plus, Calculator, Zap, Clock } from 'lucide-react';
import { RuleRow, TableSchema } from '../../../types';
import { useCompany } from '../../../context/CompanyContext';
import { ConfigurationTableRow } from './ConfigurationTableRow';
import { Button } from '../../../shared/components/Button';

interface ConfigurationTableProps {
  rules: RuleRow[];
  onChange: (rules: RuleRow[]) => void;
  activeSchema?: TableSchema;
}

export const ConfigurationTable: React.FC<ConfigurationTableProps> = ({
  rules,
  onChange,
  activeSchema
}) => {
  const { config } = useCompany();
  
  const rulesList = rules || [];

  const [isDragging, setIsDragging] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const displayColumns = useMemo(() => {
      // Get all active dimensions configured for Rules UI
      return (config.dimensionsRegistry || []).filter(d => d.enabled && d.ui.rule);
  }, [config.dimensionsRegistry]);

  const handleUpdateRule = (updatedRule: RuleRow) => {
    onChange(rulesList.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const handleAddRule = () => {
    const newRule: RuleRow = {
      id: crypto.randomUUID(), 
      order: rulesList.length + 1, 
      conditions: [],
      balanceType: 'period_balance', 
      effectNature: 'add', 
      valueBasis: 'system_amount', 
      enabled: true
    };
    onChange([...rulesList, newRule]);
  };

  const handleDuplicateRule = (rule: RuleRow) => {
    const newRule = { ...JSON.parse(JSON.stringify(rule)), id: crypto.randomUUID(), order: rulesList.length + 1 };
    onChange([...rulesList, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    onChange(rulesList.filter(r => r.id !== id));
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _rules = [...rulesList];
    const draggedItemContent = _rules[dragItem.current];
    _rules.splice(dragItem.current, 1);
    _rules.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
    onChange(_rules.map((r, i) => ({ ...r, order: i + 1 })));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-right border-collapse min-w-[1300px]">
          <thead className="sticky top-0 z-30 backdrop-blur-md bg-surface-app/90">
            {/* Multi-level Header */}
            <tr>
                <th colSpan={displayColumns.length + 2} className="px-6 py-2 border-b border-border-subtle text-[9px] font-black text-txt-muted uppercase tracking-[0.2em] text-center bg-surface-card/50">أبعاد التصفية (Data Source Filters)</th>
                <th colSpan={3} className="px-6 py-2 border-b border-purple-500/20 bg-purple-900/10 text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] text-center border-r border-l border-border-subtle">منطق المعالجة والمحرك (Logic Engine)</th>
                <th className="border-b border-border-subtle bg-surface-card/50"></th>
            </tr>
            <tr>
              <th className="px-2 py-3 text-center border-b border-border-subtle w-14 sticky right-0 bg-surface-app"></th>
              <th className="px-2 py-3 text-center border-b border-border-subtle w-8 sticky right-14 bg-surface-app text-[10px] text-txt-muted font-bold">#</th>
              
              {displayColumns.map(dim => (
                <th key={dim.id} className="px-2 py-4 text-right border-b border-border-subtle text-[10px] font-black text-txt-secondary uppercase tracking-wider">
                  {dim.label}
                </th>
              ))}

              {/* Engine Columns Header */}
              <th className="px-3 py-4 text-right border-b border-purple-500/20 bg-purple-900/20 text-[10px] font-black text-purple-300 uppercase tracking-wider w-40 border-r border-border-subtle">
                  <div className="flex items-center gap-1.5"><Calculator size={14}/> أساس القيمة</div>
              </th>
              <th className="px-3 py-4 text-right border-b border-blue-500/20 bg-blue-900/20 text-[10px] font-black text-blue-300 uppercase tracking-wider w-36">
                  <div className="flex items-center gap-1.5"><Clock size={14}/> نوع الرصيد</div>
              </th>
              <th className="px-3 py-4 text-center border-b border-slate-500/20 bg-surface-card text-[10px] font-black text-txt-secondary uppercase tracking-wider w-28 border-l border-border-subtle">
                  <div className="flex items-center justify-center gap-1.5"><Zap size={14}/> التأثير</div>
              </th>

              <th className="px-2 py-4 text-center border-b border-border-subtle w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rulesList.map((rule, index) => (
              <ConfigurationTableRow 
                key={rule.id} rule={rule} index={index} isDragging={isDragging} dragItemRef={dragItem} dragOverItemRef={dragOverItem}
                onDragStart={(idx: any) => { dragItem.current = idx; setIsDragging(true); }} onDragEnter={(idx: any) => { dragOverItem.current = idx; }} onDragEnd={handleSort}
                onUpdateRule={handleUpdateRule} onDuplicate={handleDuplicateRule} onDelete={handleDeleteRule} activeDimensions={displayColumns}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-5 border-t border-border-subtle bg-surface-overlay shrink-0">
          <Button variant="secondary" onClick={handleAddRule} icon={<Plus size={16} />} className="w-full border-dashed border border-border-subtle hover:border-primary-500/50 hover:bg-primary-900/20 transition-all font-black text-xs py-3 text-primary-400 rounded-2xl">
              إضافة قاعدة معالجة جديدة للمحرك
          </Button>
      </div>
    </div>
  );
};
