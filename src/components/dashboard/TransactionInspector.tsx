
import React from 'react';
import { 
    X, Search, ShieldAlert, ArrowRight, Zap, 
    Calculator, CheckCircle2, XCircle, Hash, ArrowDownRight, ArrowUpRight, GitMerge
} from 'lucide-react';
import { Transaction, RuleRow } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { traceTransactionRules, RuleTraceResult } from '../../core/logic/MetricCalculator/TransactionTrace';
import { useMetricContext } from '../../hooks/useMetricContext';
import { useLabelResolver } from '../../hooks/useLabelResolver';
import { SchemaService } from '../../core/services/SchemaService';

interface TransactionInspectorProps {
    transaction: Transaction;
    rules: RuleRow[];
    onClose: () => void;
}

export const TransactionInspector: React.FC<TransactionInspectorProps> = ({ transaction, rules, onClose }) => {
    const { config } = useCompany();
    const context = useMetricContext();
    const { resolveLabel } = useLabelResolver();
    
    const trace = traceTransactionRules(transaction, rules, context);
    const finalImpact = trace.length > 0 ? trace[trace.length - 1].runningTotal : 0;
    
    // Generic currency lookup
    const currency = config.systemConstants?.['currencySymbol'] || '';

    // Get 2 primary dimensions for display (e.g., Project, Category) if available
    const primaryDimensions = (config.dimensionsRegistry || [])
        .filter(d => d.enabled && !['date', 'amount', 'description', 'sourceRef'].includes(d.id))
        .slice(0, 4);

    return (
        <div className="absolute inset-y-0 left-0 w-full md:w-[450px] bg-surface-sidebar/95 backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.5)] z-50 border-r border-border-subtle flex flex-col animate-fade-in-right">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border-subtle bg-surface-overlay text-txt-main flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shadow-lg shadow-blue-500/10 border border-blue-500/30">
                        <Search size={18} />
                    </div>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-wider text-txt-main">تدقيق مسار المحرك</h3>
                        <p className="text-[10px] text-blue-400 font-bold">Transaction Logic Audit</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-txt-muted hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-surface-app/50">
                {/* Transaction Identity Card */}
                <section className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-500/50"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">المرجع</span>
                            <h4 className="font-black text-txt-main font-mono text-sm mt-1">{transaction.sourceRef || '---'}</h4>
                        </div>
                        <div className="text-left">
                            <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">المبلغ الأصلي</span>
                            <div className="text-lg font-black text-txt-main tabular-nums">
                                {transaction.amount.toLocaleString()} 
                                <span className="text-[10px] text-txt-muted mr-1">{currency}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-txt-muted">تاريخ الحركة</span>
                            <span className="text-xs font-mono text-txt-secondary">{transaction.date}</span>
                        </div>
                        {primaryDimensions.map(dim => {
                            const val = SchemaService.getValue(transaction, dim.id, config);
                            return (
                                <div key={dim.id} className="flex flex-col">
                                    <span className="text-[9px] font-bold text-txt-muted">{dim.label}</span>
                                    <span className="text-xs font-bold text-txt-secondary truncate" title={resolveLabel(dim.id, val)}>
                                        {resolveLabel(dim.id, val)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Processing Steps */}
                <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-txt-muted uppercase tracking-widest px-1 flex items-center gap-2">
                        <Zap size={12} className="text-amber-500" />
                        مراحل التنفيذ المنطقي
                    </h5>
                    {trace.map((step, idx) => (
                        <TraceStep key={idx} step={step} index={idx} />
                    ))}
                    {trace.length === 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                            <ShieldAlert className="text-amber-500 shrink-0" size={18} />
                            <p className="text-xs text-amber-200/80 leading-relaxed font-bold">الحركة لم تطابق أي قاعدة نشطة في المحرك، لذلك تم استبعادها من الإجماليات.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="p-6 border-t border-border-subtle bg-surface-overlay shrink-0">
                <div className="bg-surface-card rounded-2xl p-5 border border-border-highlight relative overflow-hidden shadow-neon">
                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-blue-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-txt-muted">التأثير الصافي النهائي</span>
                        </div>
                        <div className="text-2xl font-black tabular-nums text-white">
                            {finalImpact > 0 ? '+' : ''}{finalImpact.toLocaleString()}
                        </div>
                    </div>
                    <p className="text-[9px] text-txt-muted mt-2 italic opacity-70">النتيجة بعد تطبيق كافة قواعد الإضافة والخصم والنسب المئوية.</p>
                </div>
            </div>
        </div>
    );
};

const TraceStep: React.FC<{ step: RuleTraceResult, index: number }> = ({ step, index }) => {
    const isSuccess = step.isMatch;
    
    return (
        <div className={`relative pl-4 border-r-2 transition-all duration-500 ${isSuccess ? 'border-blue-500' : 'border-border-subtle opacity-60'}`}>
            <div className={`absolute top-0 -right-2.5 w-5 h-5 rounded-full border-2 bg-surface-card flex items-center justify-center transition-all ${isSuccess ? 'border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-border-subtle text-txt-muted'}`}>
                {isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            </div>
            
            <div className={`p-4 rounded-2xl border transition-all ${isSuccess ? 'bg-surface-card border-blue-500/30 shadow-md' : 'bg-surface-input border-transparent'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-txt-muted uppercase">القاعدة {index + 1}</span>
                        {step.rule.continueProcessing && isSuccess && (
                            <span className="flex items-center gap-1 text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 font-bold uppercase">
                                <GitMerge size={8} /> تشعبي
                            </span>
                        )}
                    </div>
                    {isSuccess && (
                        <div className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-lg border ${step.impact >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {step.impact > 0 ? <ArrowUpRight size={10} className="inline ml-1" /> : step.impact < 0 ? <ArrowDownRight size={10} className="inline ml-1" /> : null}
                            {step.impact.toLocaleString()}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    {step.conditions.map((cond, ci) => (
                        <div key={ci} className="flex items-center justify-between text-[10px] group">
                            <span className="text-txt-secondary">{cond.field}:</span>
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono bg-black/20 px-1.5 rounded text-txt-main" title="القيمة في الحركة">{cond.actual || 'فارغ'}</span>
                                <span className={`font-black ${cond.isMatch ? 'text-blue-400' : 'text-red-400'}`}>{cond.operatorLabel}</span>
                                <span className="font-bold text-txt-main" title="المطلوب في القاعدة">{cond.expected}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {isSuccess && step.formulaUsed && (
                    <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Calculator size={10} className="text-purple-400" />
                            <span className="text-[9px] font-bold text-txt-muted uppercase">أساس القيمة المحتسب:</span>
                        </div>
                        <span className="text-[10px] font-black text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20" title={step.rule.valueBasis}>
                            {step.formulaUsed}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
