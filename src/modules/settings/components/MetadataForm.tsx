
import React, { useMemo } from 'react';
import { Type, AlignLeft, ArrowUpRight, Calendar, Layers, Database, Hash, Scale, AlertTriangle, Coins } from 'lucide-react';
import { SubCard, CardDataType } from '../../../types';
import { ColorPicker } from '../../../shared/components/ColorPicker';
import { useCompany } from '../../../context/CompanyContext';
import { CARD_DATA_TYPES } from '../../../constants';

interface MetadataFormProps {
  title: string;
  description: string;
  dataType?: CardDataType;
  unit?: string;
  annualResetMonth?: number;
  color?: string;
  dataSourceId?: string;
  dashboardDefaultSourceId?: string; 
  showChangeFromPrevious?: boolean;
  showAnnualCumulative?: boolean;
  showCumulativeTotal?: boolean;
  onChange: (updates: Partial<SubCard>) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ 
  title, 
  description, 
  dataType = 'decimal_value', 
  unit = '',
  annualResetMonth = 1,
  color = 'blue',
  dataSourceId,
  dashboardDefaultSourceId,
  showChangeFromPrevious = false,
  showAnnualCumulative = false,
  showCumulativeTotal = false,
  onChange 
}) => {
  const { config } = useCompany();

  const isCurrencyEngineActive = config.currencySettings?.autoConversionEnabled;
  const baseCurrency = config.currencySettings?.baseCurrency || 'SAR';

  const effectiveDefaultId = dashboardDefaultSourceId || config.defaultDataSourceId;
  const effectiveDefaultLabel = config.dataSources.find(s => s.id === effectiveDefaultId)?.label || 'System Default';
  const defaultOptionLabel = `افتراضي (${dashboardDefaultSourceId ? 'إعداد اللوحة' : 'إعداد النظام'}: ${effectiveDefaultLabel})`;

  return (
    <div className="bg-surface-overlay backdrop-blur-md border-b border-border-subtle px-6 py-6 shadow-sm z-20">
      <div className="flex flex-col gap-6">
        {/* Top Row: Basic Info & Color */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="shrink-0">
                <ColorPicker selectedColor={color} onChange={(c) => onChange({ color: c })} label="" />
            </div>

            <div className="h-10 w-px bg-border-subtle hidden md:block mx-2"></div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div className="relative group">
                    <div className="absolute top-2.5 right-3 text-txt-muted group-focus-within:text-primary-400 transition-colors"><Type size={16} /></div>
                    <input type="text" value={title} onChange={(e) => onChange({ title: e.target.value })} className="input-fantasy w-full pr-9 pl-3 py-2 font-bold text-sm" placeholder="عنوان البطاقة (إجباري)"/>
                </div>
                <div className="relative group">
                    <div className="absolute top-2.5 right-3 text-txt-muted group-focus-within:text-primary-400 transition-colors"><AlignLeft size={16} /></div>
                    <input type="text" value={description} onChange={(e) => onChange({ description: e.target.value })} className="input-fantasy w-full pr-9 pl-3 py-2 text-sm" placeholder="وصف مختصر للبطاقة"/>
                </div>
                <div className="relative group">
                    <div className="absolute top-2.5 right-3 text-txt-muted group-focus-within:text-primary-400 transition-colors"><Database size={16} /></div>
                    <select value={dataSourceId || ''} onChange={(e) => onChange({ dataSourceId: e.target.value || undefined })} className="input-fantasy w-full pr-9 pl-3 py-2 text-sm cursor-pointer appearance-none">
                        <option value="">{defaultOptionLabel}</option>
                        {config.dataSources.map(ds => <option key={ds.id} value={ds.id}>{ds.label}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* System Settings & Units */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface-input p-4 rounded-2xl border border-border-subtle">
            <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-1.5">
                    <Scale size={12}/> وحدة القياس (Unit)
                </label>
                <div className="relative group/unit">
                    <input 
                        type="text" 
                        value={isCurrencyEngineActive ? baseCurrency : unit} 
                        onChange={e => !isCurrencyEngineActive && onChange({ unit: e.target.value })} 
                        disabled={isCurrencyEngineActive}
                        placeholder="مثل: $, Kg, °C..."
                        className={`w-full px-3 py-2 border rounded-xl text-xs font-black outline-none transition-all ${
                            isCurrencyEngineActive 
                            ? 'bg-amber-900/10 border-amber-500/30 text-amber-500 cursor-not-allowed' 
                            : 'bg-surface-card border-border-subtle text-txt-main focus:border-primary-500'
                        }`} 
                    />
                    {isCurrencyEngineActive && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500">
                            <Coins size={14} />
                        </div>
                    )}
                </div>
                
                {isCurrencyEngineActive && (
                    <div className="flex items-start gap-1.5 mt-2 bg-amber-900/20 p-2 rounded-lg border border-amber-500/20 animate-fade-in">
                        <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-amber-400 leading-relaxed font-bold">
                            محرك العملات مفعل حالياً. سيتم تجاهل الوحدة اليدوية واستخدام <span className="underline">{baseCurrency}</span> كعملة موحدة.
                        </p>
                    </div>
                )}
            </div>
            
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> تصفير الدورة (Reset Month)</label>
                <select 
                    value={annualResetMonth} onChange={e => onChange({ annualResetMonth: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface-card border border-border-subtle rounded-xl text-xs font-bold text-txt-main outline-none cursor-pointer hover:border-border-highlight"
                >
                    {Array.from({length: 12}).map((_, i) => (
                        <option key={i+1} value={i+1}>شهر {i+1}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex items-center justify-end pt-4">
                <div className="flex items-center gap-1 bg-surface-card p-1 rounded-xl border border-border-subtle">
                    {CARD_DATA_TYPES.map((type) => (
                        <button key={type.value} onClick={() => onChange({ dataType: type.value })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dataType === type.value ? 'bg-surface-overlay text-txt-main shadow-sm border border-border-subtle' : 'text-txt-muted hover:text-txt-main'}`}>
                            {type.value === 'decimal_value' ? <span className="text-lg leading-none">0.0</span> : <Hash size={14} />}
                            <span>{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* View Toggles */}
        <div className="flex flex-wrap gap-2 pt-2">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${showChangeFromPrevious ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-surface-card border-border-subtle text-txt-muted hover:border-border-highlight hover:text-txt-main'}`}>
                <input type="checkbox" checked={showChangeFromPrevious} onChange={(e) => onChange({ showChangeFromPrevious: e.target.checked })} className="hidden" />
                <ArrowUpRight size={14} /> مقارنة بالفترة السابقة
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${showAnnualCumulative ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-surface-card border-border-subtle text-txt-muted hover:border-border-highlight hover:text-txt-main'}`}>
                <input type="checkbox" checked={showAnnualCumulative} onChange={(e) => onChange({ showAnnualCumulative: e.target.checked })} className="hidden" />
                <Calendar size={14} /> تراكمي سنوي/دوري
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${showCumulativeTotal ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-surface-card border-border-subtle text-txt-muted hover:border-border-highlight hover:text-txt-main'}`}>
                <input type="checkbox" checked={showCumulativeTotal} onChange={(e) => onChange({ showCumulativeTotal: e.target.checked })} className="hidden" />
                <Layers size={14} /> إجمالي تراكمي كلي
            </label>
        </div>
      </div>
    </div>
  );
};
