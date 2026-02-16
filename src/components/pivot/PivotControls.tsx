
import React, { useMemo, useState } from 'react';
import { AlignLeft, ArrowDown, Calculator, ChevronDown, X, Plus, FunctionSquare, Zap, Info } from 'lucide-react';
import { PivotConfig, PivotField, PivotValueDef, AggregationType, DerivedMeasure } from '../../types';
import { AGGREGATION_OPTS } from './constants';
import { useCompany } from '../../context/CompanyContext';

interface PivotControlsProps {
  config: PivotConfig;
  onConfigChange: (config: PivotConfig) => void;
}

export const PivotControls: React.FC<PivotControlsProps> = ({ config, onConfigChange }) => {
  const { config: companyConfig } = useCompany();

  // Dynamically generate pivot options from the registry
  const pivotOptions = useMemo(() => {
      const opts = [{ value: 'none', label: 'بدون' }];
      
      // Registry Dimensions (Enabled & UI.Pivot = true)
      // This now covers everything, including 'month' if defined in config
      const registryDims = (companyConfig.dimensionsRegistry || [])
          .filter(d => d.enabled && d.ui.pivot)
          .map(d => ({ value: d.id, label: d.label }));
      
      return [...opts, ...registryDims];
  }, [companyConfig.dimensionsRegistry]);

  const dynamicMeasures = useMemo(() => {
      const base = [{ value: 'amount', label: 'قيمة السند الأساسية' }, { value: 'records', label: 'عدد السجلات' }];
      const userFormulas = (companyConfig.logicRegistry?.formulas || []).map(f => ({
          value: f.id,
          label: f.label
      }));
      return [...base, ...userFormulas];
  }, [companyConfig.logicRegistry?.formulas]);

  const handleRowFieldChange = (val: PivotField) => onConfigChange({ ...config, rowField: val });
  const handleColFieldChange = (val: PivotField) => onConfigChange({ ...config, colField: val });

  const addMetric = () => {
    const newMetric: PivotValueDef = {
        id: `v${config.values.length + 1}`,
        sourceField: 'amount',
        operation: 'sum',
        label: 'مؤشر جديد'
    };
    onConfigChange({ ...config, values: [...config.values, newMetric] });
  };

  const removeMetric = (id: string) => {
    if (config.values.length <= 1) return;
    onConfigChange({ ...config, values: config.values.filter(v => v.id !== id) });
  };

  const updateMetric = (id: string, updates: Partial<PivotValueDef>) => {
      onConfigChange({
          ...config,
          values: config.values.map(v => {
              if (v.id !== id) return v;
              const newV = { ...v, ...updates };
              if (updates.operation || updates.sourceField) {
                   const opLabel = AGGREGATION_OPTS.find(o => o.value === newV.operation)?.label;
                   const fieldLabel = dynamicMeasures.find(f => f.value === newV.sourceField)?.label;
                   newV.label = (newV.operation === 'count' && newV.sourceField === 'records') ? 'عدد السجلات' : `${opLabel} ${fieldLabel}`;
              }
              return newV;
          })
      });
  };

  const addDerivedMeasure = () => {
      const newDM: DerivedMeasure = {
          id: `d${(config.derivedMeasures?.length || 0) + 1}`,
          label: 'عمود محسوب',
          expression: ''
      };
      onConfigChange({ ...config, derivedMeasures: [...(config.derivedMeasures || []), newDM] });
  };

  const updateDerivedMeasure = (id: string, updates: Partial<DerivedMeasure>) => {
      onConfigChange({
          ...config,
          derivedMeasures: (config.derivedMeasures || []).map(dm => dm.id === id ? { ...dm, ...updates } : dm)
      });
  };

  return (
    <div className="px-6 pb-6 pt-1 animate-fade-in-down space-y-4">
        <div className="flex flex-col lg:flex-row gap-6 bg-surface-input p-5 rounded-xl border border-border-subtle shadow-inner">
            <div className="flex gap-4 flex-1">
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wide flex items-center gap-1"><AlignLeft size={12} /> الصفوف</label>
                    <div className="relative">
                        <select value={config.rowField} onChange={(e) => handleRowFieldChange(e.target.value as PivotField)} className="w-full text-xs p-2.5 pl-8 rounded-lg border border-border-subtle outline-none bg-surface-card font-medium text-txt-main appearance-none shadow-sm cursor-pointer hover:border-primary-500/50">
                            {pivotOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wide flex items-center gap-1"><ArrowDown size={12} /> الأعمدة</label>
                    <div className="relative">
                        <select value={config.colField} onChange={(e) => handleColFieldChange(e.target.value as PivotField)} className="w-full text-xs p-2.5 pl-8 rounded-lg border border-border-subtle outline-none bg-surface-card font-medium text-txt-main appearance-none shadow-sm cursor-pointer hover:border-primary-500/50">
                            {pivotOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="flex-[1.5] space-y-2">
                <label className="text-[10px] font-bold text-primary-400 uppercase tracking-wide flex items-center gap-1"><Calculator size={12} /> المقاييس الأساسية</label>
                <div className="flex flex-wrap gap-2 bg-surface-card p-3 rounded-xl border border-primary-500/20 shadow-sm">
                    {config.values.map((metric) => (
                        <div key={metric.id} className="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg pl-1 pr-3 py-1 shadow-sm group hover:border-primary-500/40 transition-colors animate-scale-in">
                            <button onClick={() => removeMetric(metric.id)} className="text-primary-300 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-md transition-colors" disabled={config.values.length === 1}><X size={12} strokeWidth={3} /></button>
                            <div className="h-4 w-px bg-primary-500/20 mx-1"></div>
                            <span className="text-[9px] font-black text-primary-400 px-1 border border-primary-500/10 rounded bg-surface-input">[{metric.id}]</span>
                            <select value={metric.operation} onChange={(e) => updateMetric(metric.id, { operation: e.target.value as AggregationType })} className="text-xs font-bold text-primary-300 bg-transparent outline-none cursor-pointer appearance-none text-center hover:text-white">
                                {AGGREGATION_OPTS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                            </select>
                            <span className="text-[10px] text-primary-400/50">لـ</span>
                            <div className="relative">
                                <select value={metric.sourceField} onChange={(e) => updateMetric(metric.id, { sourceField: e.target.value as any })} className="text-xs font-medium text-primary-200 bg-transparent outline-none cursor-pointer pr-4 appearance-none min-w-[80px] hover:text-white">
                                    {dynamicMeasures.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                                <ChevronDown size={10} className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                    <button onClick={addMetric} className="flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-border-subtle text-txt-muted hover:bg-surface-input hover:text-primary-400 text-xs font-medium transition-all"><Plus size={14} /> إضافة</button>
                </div>
            </div>
        </div>

        {/* Derived Measures Section */}
        <div className="bg-purple-500/5 p-5 rounded-xl border border-purple-500/20 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <FunctionSquare size={14} /> أعمدة التحليل الذكية (Derived Columns)
                </label>
                <button onClick={addDerivedMeasure} className="text-[10px] font-black bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-500 transition-colors shadow-sm flex items-center gap-1">
                    <Plus size={12} /> إنشاء عمود حسابي
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(config.derivedMeasures || []).map(dm => (
                    <div key={dm.id} className="bg-surface-card p-4 rounded-xl border border-purple-500/20 shadow-sm flex flex-col gap-3 group hover:border-purple-500/40 transition-colors">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">{dm.id}</span>
                                <input 
                                    value={dm.label} 
                                    onChange={e => updateDerivedMeasure(dm.id, { label: e.target.value })}
                                    className="text-xs font-black text-txt-main outline-none border-b border-transparent focus:border-purple-400 bg-transparent placeholder-txt-muted"
                                    placeholder="مسمى العمود..."
                                />
                            </div>
                            <button onClick={() => onConfigChange({ ...config, derivedMeasures: config.derivedMeasures?.filter(x => x.id !== dm.id) })} className="text-txt-muted hover:text-red-400 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                        
                        <div className="relative group/input">
                            <input 
                                value={dm.expression}
                                onChange={e => updateDerivedMeasure(dm.id, { expression: e.target.value.toUpperCase() })}
                                className="w-full font-mono text-[10px] p-2 bg-surface-input text-emerald-400 rounded-lg outline-none border border-transparent focus:border-purple-500"
                                placeholder="مثال: [v2] - [v1]..."
                                dir="ltr"
                            />
                            <Zap size={10} className="absolute left-2 top-2.5 text-emerald-500 opacity-50" />
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[9px] text-txt-muted ml-1">استخدم المعرفات:</span>
                            {config.values.map(v => (
                                <button 
                                    key={v.id} 
                                    onClick={() => updateDerivedMeasure(dm.id, { expression: (dm.expression || '') + `[${v.id}]` })}
                                    className="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded hover:bg-blue-500/20 border border-blue-500/10"
                                >
                                    [{v.id}]
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {(config.derivedMeasures || []).length === 0 && (
                    <div className="col-span-full py-6 text-center text-purple-300/50 text-xs italic border border-dashed border-purple-500/20 rounded-xl">
                        لا توجد أعمدة محسوبة حالياً. يمكنك إنشاء أعمدة لمقارنة الميزانية بالفعلي أو حساب النسب المئوية.
                    </div>
                )}
            </div>
            {(config.derivedMeasures || []).length > 0 && (
                 <div className="flex items-center gap-2 text-[9px] text-purple-300 italic px-1">
                    <Info size={10} />
                    <span>الأعمدة المحسوبة تطبق المعادلات على القيم المجمعة النهائية، وليس على مستوى كل سطر حركة.</span>
                </div>
            )}
        </div>
    </div>
  );
};
