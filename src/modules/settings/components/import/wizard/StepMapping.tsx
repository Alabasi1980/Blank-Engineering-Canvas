
import React, { useMemo } from 'react';
import { AlertTriangle, Settings, Database, Layers, Key, Fingerprint, AlignLeft, Calendar, DollarSign, FileText, Info, Tag } from 'lucide-react';
import { ImportMapping, UpdateStrategy, ImportMode } from '../../../../types';
import { Button } from '../../../../../shared/components/Button';
import { useCompany } from '../../../../../context/CompanyContext';
import { useLabelResolver } from '../../../../../hooks/useLabelResolver';
import { MultiSelect } from '../../../../../shared/components/MultiSelect';

interface StepMappingProps {
  mapping: Partial<ImportMapping>;
  setMapping: React.Dispatch<React.SetStateAction<Partial<ImportMapping>>>;
  updateStrategy?: UpdateStrategy | 'validation';
  primaryKey?: string[];
  setPrimaryKey?: (keys: string[]) => void;
  columns: string[];
  onSave: () => void;
  onBack: () => void;
  isProcessing: boolean;
  errors: string[];
  sourceLabel: string;
  onSourceLabelChange: (val: string) => void;
  autoMappedFields?: string[]; 
  mode?: ImportMode;
  targetEntityId?: string;
  targetMode: 'new' | 'existing';
  sampleRow?: any;
}

export const StepMapping: React.FC<StepMappingProps> = ({
  mapping, setMapping, primaryKey = [], setPrimaryKey, columns,
  onSave, onBack, isProcessing, errors,
}) => {
  const { config } = useCompany();
  const { getSystemLabel } = useLabelResolver();
  
  const systemTargets = useMemo(() => {
      const targets = [
          { id: 'date', label: getSystemLabel('date') || 'التوقيت / التاريخ', type: 'core', required: true, icon: Calendar },
          { id: 'amount', label: getSystemLabel('amount') || 'القيمة الرقمية', type: 'core', required: true, icon: DollarSign },
          { id: 'description', label: getSystemLabel('description') || 'البيان الوصفي', type: 'core', required: false, icon: AlignLeft },
          { id: 'sourceRef', label: getSystemLabel('sourceRef') || 'رقم المرجع', type: 'core', required: false, icon: FileText },
      ];

      config.dimensionsRegistry?.forEach(dim => {
          if (dim.enabled && dim.ui.import && !['date', 'amount', 'description', 'sourceRef'].includes(dim.id)) {
              targets.push({ 
                  id: dim.id, 
                  label: dim.label, 
                  type: 'dimension', 
                  required: false,
                  icon: dim.type === 'master_data' ? Database : Tag
              });
          }
      });

      return targets;
  }, [config.dimensionsRegistry, getSystemLabel]);

  const handleMappingChange = (field: keyof ImportMapping, col: string) => {
    setMapping(prev => ({ ...prev, [field]: col }));
  };

  const onUpdateMapping = (dimId: string, val: string) => {
      setMapping(prev => ({ ...prev, customAttributes: { ...(prev.customAttributes || {}), [dimId]: val } }));
  };

  const isReady = useMemo(() => {
      if (!mapping.date || !mapping.amount) return false;
      if (!primaryKey || primaryKey.length === 0) return false;
      return true;
  }, [mapping, primaryKey]);

  const pkOptions = systemTargets.map(t => ({ value: t.id, label: t.label }));
  const coreTargets = systemTargets.filter(t => t.type === 'core');
  const customTargets = systemTargets.filter(t => t.type === 'dimension');

  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-border-subtle shadow-2xl flex flex-col max-h-[75vh] bg-surface-card animate-fade-in-up">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h3 className="text-xl font-black text-txt-main mb-1">المرحلة 3: خريطة الترجمة</h3>
          <p className="text-sm text-txt-secondary">
              قم بتوجيه أعمدة الملف (يسار) إلى حقول النظام (يمين).
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
          
          <div className="p-6 rounded-3xl border border-indigo-500/30 bg-indigo-900/10 shadow-neon relative overflow-hidden">
              <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-br-xl">دستور النزاهة</div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                              <Fingerprint size={24}/>
                          </div>
                          <h4 className="font-bold text-txt-main text-base">بصمة السجل (Unique Identity)</h4>
                      </div>
                      <p className="text-xs text-txt-secondary leading-relaxed mb-3">
                          اختر حقول النظام التي تشكل هوية فريدة لكل سجل. سيستخدم النظام هذه البصمة لمنع التكرار ودمج البيانات بشكل صحيح بغض النظر عن أسماء الأعمدة في ملفك.
                      </p>
                      
                      {setPrimaryKey && (
                          <div className="p-1 rounded-xl">
                              <MultiSelect 
                                  options={pkOptions}
                                  selectedValues={primaryKey}
                                  onChange={setPrimaryKey}
                                  label=""
                                  placeholder="اختر حقول الهوية من النظام..."
                              />
                          </div>
                      )}
                  </div>
                  
                  {primaryKey.length > 0 && (
                      <div className="w-full md:w-64 bg-black/30 border border-indigo-500/20 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                          <Key size={32} className="text-indigo-400 mb-2" />
                          <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">مكونات البصمة</span>
                          <div className="flex flex-wrap justify-center gap-1 mt-2 mb-2 font-mono text-[9px] text-indigo-300">
                              {primaryKey.map(k => pkOptions.find(o => o.value === k)?.label).join(' + ')}
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <section className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 bg-blue-900/20 w-fit px-3 py-1 rounded-full border border-blue-500/20">
                    <Settings size={14} /> حقول النظام الخام (Primitives)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coreTargets.map(t => (
                        <MappingRow 
                            key={t.id}
                            label={t.label} 
                            value={(mapping as any)[t.id]} 
                            onChange={v => handleMappingChange(t.id as any, v)} 
                            columns={columns} 
                            required={t.required} 
                            icon={t.icon}
                        />
                    ))}
                </div>
            </section>

            {customTargets.length > 0 ? (
                <section className="space-y-4 pt-4 border-t border-border-subtle">
                    <h4 className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] flex items-center gap-2 bg-surface-input w-fit px-3 py-1 rounded-full border border-border-subtle">
                        <Layers size={14} /> أبعاد التكوين (Architect Dimensions)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customTargets.map(dim => (
                            <MappingRow 
                                key={dim.id} 
                                label={dim.label} 
                                value={(mapping as any)[dim.id] || mapping.customAttributes?.[dim.id]} 
                                onChange={v => onUpdateMapping(dim.id, v)} 
                                columns={columns} 
                                icon={dim.icon} 
                            />
                        ))}
                    </div>
                </section>
            ) : (
                <div className="p-4 bg-surface-input border border-border-subtle rounded-2xl flex items-center gap-3">
                    <Info size={18} className="text-txt-muted" />
                    <p className="text-xs text-txt-secondary italic">لم يتم تعريف أبعاد إضافية في النظام. سيتم استيراد الحقول الأساسية فقط.</p>
                </div>
            )}
      </div>

      <div className="mt-6 pt-6 border-t border-border-subtle flex justify-between items-center shrink-0">
          <Button variant="secondary" onClick={onBack}>السابق</Button>
          <div className="flex gap-2">
              <Button onClick={onSave} disabled={!isReady} loading={isProcessing} className="min-w-[150px]">
                  بدء التدقيق والمطابقة
              </Button>
          </div>
      </div>
      
      {errors.length > 0 && (
        <div className="mt-4 bg-red-500/10 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake border border-red-500/30">
            <AlertTriangle size={16} /> {errors[0]}
        </div>
      )}
    </div>
  );
};

const MappingRow = ({ label, value, onChange, columns, required, icon: Icon }: any) => (
  <div className="flex flex-col gap-1.5 p-3 rounded-2xl transition-all border border-border-subtle hover:border-primary-500/30 bg-surface-input hover:bg-surface-overlay">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} className="text-txt-muted"/>}
      <span className="text-xs font-bold text-txt-secondary">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
    </div>
    <select 
      value={value || ''} onChange={(e) => onChange(e.target.value)}
      className={`input-fantasy w-full p-2 text-xs font-bold outline-none cursor-pointer ${!value && required ? 'border-amber-500/50 bg-amber-900/10 text-amber-200' : ''}`}
    >
      <option value="">{required ? '-- اختر العمود --' : '-- تجاهل --'}</option>
      {columns.map((col: string) => <option key={col} value={col}>{col}</option>)}
    </select>
  </div>
);
