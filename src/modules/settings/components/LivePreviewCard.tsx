
import React, { useMemo, useState, useEffect } from 'react';
import { RefreshCw, Calculator, PlayCircle, XCircle, Microscope, Check, Zap, Clock, ListFilter } from 'lucide-react';
import { SubCard, Transaction } from '../../../types';
import { CARD_COLORS } from '../../../constants';
import { useCompany } from '../../../context/CompanyContext';
import { useData } from '../../../core/context/DataContext';
import { useMetricContext } from '../../../hooks/useMetricContext';
import { calculateWidgetMetrics, toDateStr, traceTransactionRules } from '../../../core/logic/MetricCalculator';
import { useMasterDataStore } from '../../../context/MasterDataStoreContext';

interface LivePreviewCardProps {
  card: SubCard;
}

type PreviewPeriod = 'current' | 'last' | 'ytd';
type ViewMode = 'live' | 'simulator';

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ card }) => {
  const { config } = useCompany();
  const treeContext = useMetricContext();
  const { dataAdapter } = useData();
  const { getEntityData } = useMasterDataStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<PreviewPeriod>('current');
  
  const [simAmount, setSimAmount] = useState<number>(1000);
  const [simAttributes, setSimAttributes] = useState<Record<string, string>>({});

  const theme = CARD_COLORS.find(c => c.value === card.color) || CARD_COLORS[0];
  
  const currencySymbol = useMemo(() => {
      if (config.currencySettings?.autoConversionEnabled) {
          return config.currencySettings.baseCurrency;
      }
      return card.unit || config.systemConstants?.['currencySymbol'] || '';
  }, [config.currencySettings, config.systemConstants, card.unit]);

  const activeDimensions = useMemo(() => {
      return (config.dimensionsRegistry || []).filter(d => d.enabled && d.ui.rule);
  }, [config.dimensionsRegistry]);

  useEffect(() => {
      const loadData = async () => {
          setLoading(true);
          try {
              const result = await dataAdapter.getTransactions({ dataSourceId: card.dataSourceId });
              setData(result);
          } finally { setLoading(false); }
      };
      loadData();
  }, [card.dataSourceId, dataAdapter]);

  const dateRanges = useMemo(() => {
      const today = new Date();
      let cS, cE, pS, pE;
      if (period === 'current') {
          cS = new Date(today.getFullYear(), today.getMonth(), 1);
          cE = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          pS = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          pE = new Date(today.getFullYear(), today.getMonth(), 0);
      } else if (period === 'last') {
          cS = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          cE = new Date(today.getFullYear(), today.getMonth(), 0);
          pS = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          pE = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      } else {
          cS = new Date(today.getFullYear(), 0, 1);
          cE = today;
          pS = new Date(today.getFullYear() - 1, 0, 1);
          pE = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      }
      return { current: { start: toDateStr(cS), end: toDateStr(cE) }, prev: { start: toDateStr(pS), end: toDateStr(pE) } };
  }, [period]);

  const metrics = useMemo(() => {
      if (data.length === 0) return null;
      return calculateWidgetMetrics(data, card.rules, dateRanges.current, dateRanges.prev, card.dataType, treeContext);
  }, [data, card.rules, card.dataType, dateRanges, treeContext]);

  const traceResults = useMemo(() => {
      const mockTx: Partial<Transaction> = {
          amount: simAmount,
          attributes: simAttributes,
          date: toDateStr(new Date())
      };
      return traceTransactionRules(mockTx, card.rules, treeContext);
  }, [simAmount, simAttributes, card.rules, treeContext]);

  const finalSimValue = traceResults.length > 0 ? traceResults[traceResults.length - 1].runningTotal : 0;

  const getOptionsForDim = (dimId: string, type: string, sourceId?: string) => {
      if (type === 'master_data') {
          return getEntityData(sourceId || dimId).map(i => ({ value: i.id, label: i.name }));
      }
      if (type === 'list') {
          const list = (config.definitions as any)[sourceId || dimId] || [];
          return list.map((i: any) => ({ value: i.id, label: i.label }));
      }
      const attr = config.customAttributes?.find(a => a.id === dimId);
      if (attr?.options) return attr.options;
      return [];
  };

  return (
    <div className="glass-card rounded-2xl shadow-xl border border-border-subtle overflow-hidden sticky top-6 flex flex-col h-full max-h-[85vh] transition-all bg-surface-card">
      <div className="flex border-b border-border-subtle shrink-0 bg-surface-overlay p-1">
          <button onClick={() => setViewMode('live')} className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl transition-all ${viewMode === 'live' ? 'bg-primary-500 text-white shadow-lg' : 'text-txt-muted hover:text-txt-main hover:bg-surface-input'}`}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> المعاينة الحية
          </button>
          <button onClick={() => setViewMode('simulator')} className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl transition-all ${viewMode === 'simulator' ? 'bg-secondary text-white shadow-lg' : 'text-txt-muted hover:text-txt-main hover:bg-surface-input'}`}>
              <Microscope size={14} /> محاكي المنطق
          </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-app p-5">
        {viewMode === 'live' ? (
            <div className="space-y-6 animate-fade-in">
                <div className="flex bg-surface-input p-1 rounded-xl gap-1">
                    {[{ id: 'current', label: 'الفترة الحالية' }, { id: 'last', label: 'السابقة' }, { id: 'ytd', label: 'السنوي' }].map(p => (
                        <button key={p.id} onClick={() => setPeriod(p.id as PreviewPeriod)} className={`flex-1 text-[10px] py-1.5 rounded-lg transition-all ${period === p.id ? 'bg-surface-card font-black text-primary-400 shadow-sm border border-border-highlight' : 'text-txt-muted hover:text-txt-main'}`}>{p.label}</button>
                    ))}
                </div>
                
                <div className={`bg-surface-card border-2 ${theme.border} shadow-2xl rounded-3xl p-6 relative overflow-hidden group transition-all hover:scale-[1.02]`}>
                    <div className={`absolute top-0 right-0 w-2 h-full ${theme.bg}`}></div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{card.title || 'بدون عنوان'}</span>
                        <Calculator size={18} className={theme.text} />
                    </div>
                    <div className="text-4xl font-black text-txt-main tabular-nums mb-1">
                        {metrics ? Math.floor(metrics.currentValue).toLocaleString() : '0'}
                        <span className="text-sm font-bold text-txt-muted mr-2">{currencySymbol}</span>
                    </div>
                    <div className="text-[10px] text-txt-muted font-medium">صافي القيمة المحتسبة</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-panel p-3 rounded-2xl">
                        <span className="text-[9px] font-bold text-txt-muted block mb-1">تراكمي سنوي</span>
                        <div className="text-sm font-black text-txt-main">{metrics ? Math.floor(metrics.annualValue).toLocaleString() : '0'}</div>
                    </div>
                    <div className="glass-panel p-3 rounded-2xl">
                        <span className="text-[9px] font-bold text-txt-muted block mb-1">تراكمي كلي</span>
                        <div className="text-sm font-black text-txt-main">{metrics ? Math.floor(metrics.cumulativeValue).toLocaleString() : '0'}</div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="space-y-6 animate-fade-in-up">
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                    <h5 className="text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-2"><PlayCircle size={14} className="text-purple-500" /> مدخلات المحاكاة (Inputs)</h5>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[9px] font-bold text-txt-muted mb-1">قيمة افتراضية (Value)</label>
                            <input type="number" value={simAmount} onChange={e => setSimAmount(Number(e.target.value))} className="input-fantasy w-full text-sm font-black text-txt-main" />
                        </div>
                        
                        {activeDimensions.map(dim => {
                            const options = getOptionsForDim(dim.id, dim.type, dim.sourceEntityId);
                            return (
                                <div key={dim.id}>
                                    <label className="block text-[9px] font-bold text-txt-muted mb-1">{dim.label}</label>
                                    {options.length > 0 ? (
                                        <select 
                                            value={simAttributes[dim.id] || ''} 
                                            onChange={e => setSimAttributes({...simAttributes, [dim.id]: e.target.value})} 
                                            className="input-fantasy w-full text-xs font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">(الكل / غير محدد)</option>
                                            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    ) : (
                                        <input 
                                            type={dim.type === 'number' ? 'number' : 'text'}
                                            value={simAttributes[dim.id] || ''}
                                            onChange={setSimAttributes ? (e => setSimAttributes({...simAttributes, [dim.id]: e.target.value})) : undefined}
                                            className="input-fantasy w-full text-xs font-bold"
                                            placeholder="أدخل قيمة..."
                                        />
                                    )}
                                </div>
                            );
                        })}
                        
                        {activeDimensions.length === 0 && (
                            <div className="p-3 bg-amber-500/10 text-amber-400 text-[10px] rounded-lg border border-amber-500/20 flex items-center gap-2">
                                <ListFilter size={14} />
                                لم يتم تعريف أي أبعاد للتصفية في هذا النظام بعد.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-txt-muted uppercase tracking-widest px-1"><Zap size={14} className="text-amber-500" /> تحليل مسار المعالجة</h5>
                    {traceResults.map((res, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border transition-all ${res.isMatch ? 'bg-surface-card border-primary-500/50 shadow-neon' : 'bg-surface-input border-border-subtle opacity-60'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-txt-secondary">قاعدة #{idx + 1}</span>
                                {res.isMatch ? <Check size={14} className="text-green-500" /> : <XCircle size={14} className="text-txt-muted" />}
                            </div>
                            <div className="text-xs font-bold text-txt-main mb-2">
                                {res.isMatch ? `تطابق: تأثير (${res.impact > 0 ? '+' : ''}${res.impact})` : 'تجاوز: الشروط غير متطابقة'}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {res.conditions.map((c, ci) => (
                                    <span key={ci} className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${c.isMatch ? 'bg-primary-500/10 text-primary-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {c.field} {c.operatorLabel} {c.expected}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-surface-card rounded-3xl p-6 text-txt-main shadow-2xl relative overflow-hidden mt-6 border border-border-highlight">
                        <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                        <span className="text-[10px] font-black text-txt-muted uppercase block mb-1">النتيجة النهائية للمحاكاة</span>
                        <div className="text-3xl font-black tabular-nums">
                            {finalSimValue.toLocaleString()}
                            <span className="text-xs text-txt-muted mr-2">{currencySymbol}</span>
                        </div>
                        <div className="text-[9px] text-txt-muted mt-1 flex items-center gap-1">
                            <Clock size={10} /> ناتج المحرك لهذه الحالة
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
