
import React from 'react';
import { RuleRow } from '../../../types';
import { Plus, Minus, Hash, CircleDashed, Calculator, AlertTriangle, GitMerge } from 'lucide-react';
import { useCompany } from '../../../context/CompanyContext';
import { LogicEngineService } from '../../../core/services/LogicEngineService';
import { useLabelResolver } from '../../../hooks/useLabelResolver';

interface LogicVisualizerProps {
  rules: RuleRow[];
}

export const LogicVisualizer: React.FC<LogicVisualizerProps> = ({ rules }) => {
  const { config } = useCompany();
  const { resolveLabel } = useLabelResolver();
  const formulas = config.logicRegistry?.formulas || [];
  
  const rulesList = rules || [];

  const checkIsShadowed = (index: number) => {
      if (index === 0) return false;
      for (let i = 0; i < index; i++) {
          const prev = rulesList[i];
          if (prev.enabled === false || prev.continueProcessing) continue;
          
          const conditions = LogicEngineService.normalizeRuleConditions(prev);
          const isPrevUniversal = conditions.length === 0 || conditions.every(c => !c.values || c.values.length === 0 || c.values.includes('all'));
          
          if (isPrevUniversal) return true;
      }
      return false;
  };

  const getBasisLabel = (basisId: string) => {
      if (basisId === 'system_amount') return 'القيمة الأساسية';
      const formula = formulas.find(f => f.id === basisId);
      return formula ? formula.label : 'الإجمالي';
  };

  if (rulesList.length === 0) return (
      <div className="bg-surface-input border-b border-border-subtle p-8 flex flex-col items-center justify-center text-txt-muted border-dashed m-2 rounded-xl">
          <Calculator size={32} className="mb-2 opacity-50" />
          <p className="text-xs font-bold">لم يتم تعريف أي قواعد احتساب بعد</p>
      </div>
  );

  return (
    <div className="bg-surface-app border-b border-border-subtle px-6 py-5 flex flex-col gap-4">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-2"><Hash size={12} /> مسار معالجة البيانات</h4>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">أولوية تنفيذ تنازلية</span>
      </div>
      <div className="space-y-0 relative">
        <div className="absolute top-4 bottom-4 right-[19px] w-0.5 bg-border-subtle z-0"></div>
        {rulesList.map((rule, idx) => {
          const isEnabled = rule.enabled !== false;
          const isShadowed = isEnabled && checkIsShadowed(idx);
          
          const conditions = LogicEngineService.normalizeRuleConditions(rule);
          let targets = "كافة السندات";
          
          if (conditions.length > 0) {
              const displayParts: string[] = [];
              conditions.forEach(c => {
                  if (c.values && c.values.length > 0 && !c.values.includes('all')) {
                      const dimDef = config.dimensionsRegistry?.find(d => d.id === c.dimensionId);
                      const label = dimDef ? dimDef.label : c.dimensionId;
                      
                      let valStr = '';
                      if (dimDef?.type === 'list' || dimDef?.type === 'master_data') {
                          valStr = c.values.map(v => resolveLabel(dimDef.sourceEntityId || dimDef.id, v)).join(', ');
                      } else {
                          valStr = c.values.join(', ');
                      }
                      
                      if (valStr.length > 30) valStr = valStr.substring(0, 30) + '...';
                      displayParts.push(`${label}: ${valStr}`);
                  }
              });
              if (displayParts.length > 0) {
                  targets = displayParts.join(' + ');
              }
          }

          return (
            <div key={rule.id} className={`relative z-10 flex items-start gap-4 group ${!isEnabled ? 'opacity-30 grayscale' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-surface-app font-black text-xs shadow-sm transition-all ${!isEnabled ? 'bg-surface-input text-txt-muted' : isShadowed ? 'bg-amber-500 text-white' : rule.effectNature === 'neutral' ? 'bg-slate-600 text-white' : rule.effectNature === 'add' ? 'bg-primary-600 text-white' : 'bg-red-600 text-white'}`}>
                    {isShadowed ? <AlertTriangle size={16} /> : rule.effectNature === 'neutral' ? <CircleDashed size={16} /> : rule.effectNature === 'add' ? <Plus size={16} strokeWidth={3} /> : <Minus size={16} strokeWidth={3} />}
                </div>
                <div className="flex-1 mb-4">
                    <div className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm transition-all relative overflow-hidden ${!isEnabled ? 'bg-surface-input border-border-subtle' : isShadowed ? 'bg-amber-500/10 border-amber-500/30' : 'bg-surface-card border-border-subtle hover:border-primary-500/50'}`}>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">الخطوة {idx + 1}</span>
                                {rule.continueProcessing && <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1"><GitMerge size={10} /> تشعبي</span>}
                            </div>
                            <div className="text-xs font-bold text-txt-main truncate max-w-md">{targets} {isShadowed && <span className="text-amber-500 mr-2">(محجوبة بقاعدة سابقة)</span>}</div>
                        </div>
                        <div className="flex items-center gap-3 pl-2 md:border-r md:border-border-subtle md:pr-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-txt-muted font-bold uppercase tracking-tighter">الأساس</span>
                                <span className="text-[10px] font-black text-primary-400 whitespace-nowrap">{getBasisLabel(rule.valueBasis)}</span>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black min-w-[50px] text-center ${rule.effectNature === 'neutral' ? 'bg-surface-input text-txt-muted' : rule.effectNature === 'add' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {rule.effectNature === 'neutral' ? 'استثناء' : rule.effectNature === 'add' ? 'إضافة' : 'خصم'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          );
        })}
        <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-surface-app bg-surface-card text-secondary shadow-xl"><Calculator size={18} /></div>
            <div className="px-5 py-2.5 bg-surface-card text-txt-main rounded-xl text-xs font-black shadow-lg border border-border-highlight">ناتج البطاقة النهائي</div>
        </div>
      </div>
    </div>
  );
};
