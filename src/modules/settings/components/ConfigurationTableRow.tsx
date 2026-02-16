
import React from 'react';
import { GripVertical, Copy, Trash2, Eye, EyeOff, Calculator, GitMerge, AlertCircle, Unlink } from 'lucide-react';
import { RuleRow, ConditionOperator, DimensionDefinition } from '../../../types';
import { MultiSelect } from '../../../shared/components/MultiSelect'; 
import { BALANCE_TYPES, EFFECT_NATURES } from '../../../constants';
import { useMasterDataStore } from '../../../context/MasterDataStoreContext';
import { LogicEngineService } from '../../../core/services/LogicEngineService';
import { useCompany } from '../../../context/CompanyContext';

export const ConfigurationTableRow: React.FC<any> = ({
    rule, index, isDragging, dragItemRef, dragOverItemRef, onDragStart, onDragEnter, onDragEnd, onUpdateRule, onDuplicate, onDelete, activeDimensions
}) => {
    const { getEntityData } = useMasterDataStore();
    const { config } = useCompany();
    const dynamicFormulas = config.logicRegistry?.formulas || [];
    const isEnabled = rule.enabled !== false;
    const isCascading = !!rule.continueProcessing;

    const handleConditionUpdate = (dimId: string, values: any[], operator: ConditionOperator = 'in') => {
        onUpdateRule(LogicEngineService.updateRuleCondition(rule, dimId, values, operator));
    };

    const orphanedConditions = (rule.conditions || []).filter((c: any) => 
        !activeDimensions.some((d: any) => d.id === c.dimensionId)
    );

    const renderDimensionCell = (dim: DimensionDefinition) => {
        const conditions = LogicEngineService.normalizeRuleConditions(rule);
        const condition = conditions.find(c => c.dimensionId === dim.id) || { dimensionId: dim.id, operator: 'in' as ConditionOperator, values: [] };
        
        const isLookup = dim.type === 'master_data' || dim.type === 'list';

        if (isLookup && condition.operator === 'in') {
            let options: { value: string; label: string }[] = [];
            
            if (dim.type === 'master_data') {
                const entityItems = getEntityData(dim.sourceEntityId || dim.id);
                options = entityItems.map(i => ({ value: i.id, label: i.name }));
            } else if (dim.type === 'list') {
                const listKey = dim.sourceEntityId || dim.id;
                const definedList = (config.definitions as any)?.[listKey] || [];
                options = definedList.map((i: any) => ({ value: i.id, label: i.label }));
            }

            return <MultiSelect options={options} selectedValues={condition.values} onChange={(vals) => handleConditionUpdate(dim.id, vals)} label="" placeholder="الكل" />;
        }

        return (
            <div className="flex flex-col gap-1">
                <select 
                    value={condition.operator} 
                    onChange={e => handleConditionUpdate(dim.id, condition.values, e.target.value as ConditionOperator)}
                    className="text-[9px] font-bold bg-surface-card text-txt-secondary border border-border-subtle rounded px-1 py-0.5 w-fit outline-none cursor-pointer hover:border-border-highlight"
                >
                    <option value="in">يتضمن</option>
                    <option value="not_in">لا يتضمن</option>
                    <option value="equals">يساوي</option>
                    <option value="greater_than">أكبر من</option>
                    <option value="less_than">أصغر من</option>
                    <option value="contains">يحتوي نص</option>
                </select>
                <input 
                    type={dim.type === 'number' ? 'number' : 'text'}
                    value={condition.values[0] || ''}
                    onChange={e => handleConditionUpdate(dim.id, [e.target.value], condition.operator)}
                    placeholder="..."
                    className="input-fantasy w-full text-[10px] p-1.5 h-8"
                />
            </div>
        );
    };

    return (
        <tr className={`group transition-all align-top hover:bg-surface-overlay/50 ${isEnabled ? '' : 'opacity-40 grayscale bg-surface-input'}`} draggable onDragStart={() => onDragStart(index)} onDragEnter={() => onDragEnter(index)} onDragEnd={onDragEnd} onDragOver={e => e.preventDefault()}>
          <td className="px-2 py-4 text-center sticky right-0 z-10 bg-inherit border-l border-border-subtle w-14">
              <div className="flex items-center justify-center gap-1">
                <button className="cursor-move text-txt-muted hover:text-txt-main"><GripVertical size={14} /></button>
                <button onClick={() => onUpdateRule({...rule, enabled: !isEnabled})} className="text-txt-muted hover:text-primary-400">{isEnabled ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
              </div>
          </td>
          <td className="px-2 py-4 text-center sticky right-14 z-10 bg-inherit border-l border-border-subtle w-8 text-[10px] text-txt-muted font-mono">
              {index + 1}
              {orphanedConditions.length > 0 && (
                  <div className="mt-1" title={`يوجد ${orphanedConditions.length} شروط لأبعاد محذوفة`}>
                      <AlertCircle size={12} className="text-red-500 mx-auto" />
                  </div>
              )}
          </td>
          
          {activeDimensions.map((dim: any) => (
            <td key={dim.id} className="px-2 py-4 min-w-[140px]">{renderDimensionCell(dim)}</td>
          ))}

          <td className="px-2 py-4 bg-purple-900/5 border-r border-border-subtle">
                <div className="relative">
                    <Calculator size={12} className="absolute top-2.5 right-2 text-purple-400 pointer-events-none" />
                    <select value={rule.valueBasis} onChange={e => onUpdateRule({...rule, valueBasis: e.target.value})} className={`w-full text-[10px] font-black py-2 pr-7 pl-2 rounded-xl border bg-surface-input text-txt-main outline-none appearance-none cursor-pointer ${rule.valueBasis !== 'system_amount' && !dynamicFormulas.some((f: any) => f.id === rule.valueBasis) ? 'border-red-500 text-red-400' : 'border-purple-500/30 text-purple-300 hover:border-purple-500/50'}`}>
                        <option value="system_amount">القيمة الأساسية</option>
                        {dynamicFormulas.map((f: any) => <option key={f.id} value={f.id}>{f.label}</option>)}
                        {rule.valueBasis !== 'system_amount' && !dynamicFormulas.some((f: any) => f.id === rule.valueBasis) && (
                            <option value={rule.valueBasis}>[معادلة مفقودة: {rule.valueBasis}]</option>
                        )}
                    </select>
                </div>
                {orphanedConditions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {orphanedConditions.map((c: any) => (
                            <span key={c.dimensionId} className="bg-red-900/30 text-red-400 text-[8px] font-black px-1 rounded border border-red-800 flex items-center gap-1">
                                <Unlink size={8} /> {c.dimensionId}
                            </span>
                        ))}
                    </div>
                )}
          </td>

          <td className="px-2 py-4 bg-blue-900/5">
            <select value={rule.balanceType} onChange={e => onUpdateRule({...rule, balanceType: e.target.value})} className="w-full text-[10px] font-bold py-2 px-2 rounded-xl border border-blue-500/30 bg-surface-input text-blue-300 outline-none cursor-pointer hover:border-blue-500/50">
                {BALANCE_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </td>

          <td className="px-2 py-4 bg-surface-card border-l border-border-subtle">
               <select value={rule.effectNature} onChange={e => onUpdateRule({...rule, effectNature: e.target.value})} className={`text-[10px] py-2 px-2 rounded-xl border font-black outline-none w-full appearance-none bg-surface-input cursor-pointer ${rule.effectNature === 'add' ? 'text-emerald-400 border-emerald-500/30' : rule.effectNature === 'subtract' ? 'text-red-400 border-red-500/30' : 'text-txt-muted border-border-subtle'}`}>
                    {EFFECT_NATURES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
          </td>

          <td className="px-2 py-4 text-center">
            <div className="flex items-center justify-center gap-2">
                <button onClick={() => onUpdateRule({...rule, continueProcessing: !isCascading})} className={`p-1.5 rounded-lg transition-all ${isCascading ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'text-txt-muted hover:text-txt-main'}`} title="المعالجة التشعبية"><GitMerge size={14}/></button>
                <button onClick={() => onDuplicate(rule)} className="text-txt-muted hover:text-blue-400"><Copy size={14}/></button>
                <button onClick={() => onDelete(rule.id)} className="text-txt-muted hover:text-red-400"><Trash2 size={14}/></button>
            </div>
          </td>
        </tr>
    );
};
