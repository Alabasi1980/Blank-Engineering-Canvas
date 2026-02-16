
import React, { useState, useMemo } from 'react';
import { 
    Wand2, Calculator, Plus, Trash2, 
    Code, ArrowRightLeft, Key, Info, AlertCircle, MinusCircle, CircleDashed, Variable, Hash
} from 'lucide-react';
import { useCompany } from '../../../../context/CompanyContext';
import { LogicFormula, CalculationVariable } from '../../../../types';
import { Button } from '../../../../shared/components/Button';
import { SettingsSectionHeader } from './SettingsSectionHeader';
import { useMasterDataStore } from '../../../../context/MasterDataStoreContext';
// Fix: Use LogicEngineService instead of deleted TransactionEvaluator
import { LogicEngineService } from '../../../../core/services/LogicEngineService';
import { useUI } from '../../../../context/UIContext';
import { SettingHelpBlock } from './SettingHelpBlock';
import { GenericGuideModal } from './GenericGuideModal';

type TabType = 'variables' | 'formulas' | 'direction';

export const LogicArchitect: React.FC = () => {
    const { config, updateConfig } = useCompany();
    const { getEntityData } = useMasterDataStore();
    const { showToast } = useUI();
    const [testValue, setTestValue] = useState(100);
    const [activeTab, setActiveTab] = useState<TabType>('variables');
    const [showHelp, setShowHelp] = useState(false);
    
    // For Adding Constants
    const [newConstKey, setNewConstKey] = useState('');
    const [newConstVal, setNewConstVal] = useState('');

    const formulas = config.logicRegistry?.formulas || [];
    const variables = config.logicRegistry?.variables || [];
    const constants = config.systemConstants || {};
    const dimensions = config.dimensionsRegistry || [];
    const directionDimId = config.logicRegistry?.directionDimensionId || '';
    const directionLogic = config.logicRegistry?.directionLogic || {};
    
    const availableBindings = useMemo(() => {
        return dimensions.filter(d => d.enabled).map(dim => ({
            id: dim.id,
            label: dim.label,
            group: dim.type === 'master_data' ? 'قوائم مرجعية' : 'سمات وحقول'
        }));
    }, [dimensions]);

    const directionProviderValues = useMemo(() => {
        if (!directionDimId) return [];
        const dim = dimensions.find(d => d.id === directionDimId);
        if (!dim) return [];
        if (dim.type === 'master_data') return getEntityData(dim.sourceEntityId || dim.id).map(i => ({ id: i.id, label: i.name }));
        if (dim.type === 'list') {
            const listKey = dim.sourceEntityId || dim.id;
            const definedList = (config.definitions as any)?.[listKey] || [];
            return definedList.map((i: any) => ({ id: i.id, label: i.label }));
        }
        return [];
    }, [directionDimId, dimensions, config.definitions, getEntityData]);

    const handleUpdateFormula = (id: string, updates: Partial<LogicFormula>) => {
        updateConfig({ logicRegistry: { ...config.logicRegistry, formulas: formulas.map(f => f.id === id ? { ...f, ...updates } : f) } });
    };

    const handleAddFormula = () => {
        const newF: LogicFormula = { id: `form_${crypto.randomUUID().slice(0, 4)}`, label: 'معادلة جديدة', description: '', expression: '', type: 'mathematical', scope: 'row' };
        updateConfig({ logicRegistry: { ...config.logicRegistry, formulas: [...formulas, newF] } });
    };

    const handleAddVariable = () => {
        if (availableBindings.length === 0) { showToast("يرجى تعريف (أبعاد بيانات) أولاً.", 'error'); return; }
        const newV: CalculationVariable = { id: `VAR_${crypto.randomUUID().slice(0, 3).toUpperCase()}`, label: 'مسمى جديد', sourceType: 'custom_attribute', sourceKey: availableBindings[0]?.id || '' };
        updateConfig({ logicRegistry: { ...config.logicRegistry, variables: [...variables, newV] } });
    };

    const handleAddConstant = () => {
        if (!newConstKey.trim()) return;
        updateConfig({ systemConstants: { ...constants, [newConstKey.trim().toUpperCase()]: newConstVal } });
        setNewConstKey(''); setNewConstVal('');
    };

    const handleUpdateDirectionDim = (dimId: string) => {
        updateConfig({ logicRegistry: { ...config.logicRegistry, directionDimensionId: dimId, directionLogic: {} } });
    };

    const handleUpdateDirectionValue = (valId: string, effect: 'positive' | 'negative' | 'neutral') => {
        updateConfig({ logicRegistry: { ...config.logicRegistry, directionLogic: { ...directionLogic, [valId]: effect } } });
    };

    const insertToFormula = (formulaId: string, text: string) => {
        const f = formulas.find(x => x.id === formulaId);
        if (f) handleUpdateFormula(formulaId, { expression: (f.expression || '') + ' ' + text });
    };

    const solvePreview = (formula: LogicFormula) => {
        if (!formula.expression) return 0;
        try {
            const context: any = {};
            variables.forEach(v => context[v.id] = testValue);
            Object.entries(constants).forEach(([k,v]) => context[k] = Number(v) || 0);
            
            // Fix: Use LogicEngineService.evaluate
            return LogicEngineService.evaluate(formula.expression, context);
        } catch { return 'Error'; }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20 custom-scrollbar">
            <SettingsSectionHeader 
                title="مترجم المنطق (Logic Translator)"
                description="مركز التحكم بالذكاء الحسابي. هنا تقوم بتعريف المتغيرات الحية، الثوابت العامة، وصياغة المعادلات الرياضية."
                icon={Wand2}
                bgClass="bg-blue-500/10"
                iconColorClass="text-blue-400"
            />

            <div className="flex bg-surface-input p-1.5 rounded-2xl w-fit shadow-inner">
                <button onClick={() => setActiveTab('variables')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'variables' ? 'bg-surface-card text-blue-400 shadow-md border border-border-highlight' : 'text-txt-secondary hover:text-txt-main'}`}>1. المتغيرات والثوابت</button>
                <button onClick={() => setActiveTab('formulas')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'formulas' ? 'bg-surface-card text-blue-400 shadow-md border border-border-highlight' : 'text-txt-secondary hover:text-txt-main'}`}>2. بناء المعادلات</button>
                <button onClick={() => setActiveTab('direction')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'direction' ? 'bg-surface-card text-purple-400 shadow-md border border-border-highlight' : 'text-txt-secondary hover:text-txt-main'}`}>3. منطق الاتجاه (+/-)</button>
            </div>

            {activeTab === 'variables' && (
                <div className="space-y-12 animate-fade-in-up">
                    {/* Dynamic Variables Section */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-txt-main text-lg flex items-center gap-2"><Variable size={20} className="text-blue-500" /> المتغيرات الحية (Dynamic Bindings)</h3>
                                <p className="text-xs text-txt-secondary">ربط أعمدة البيانات (مثل الكمية، السعر) بأسماء برمجية لاستخدامها في المعادلات.</p>
                            </div>
                            <Button onClick={handleAddVariable} size="sm" icon={<Plus size={16}/>}>إضافة متغير</Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {variables.map(variable => (
                                <div key={variable.id} className="glass-card p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-6 group hover:border-blue-500/30 transition-all bg-surface-card">
                                    <input value={variable.id} onChange={e => updateConfig({ logicRegistry: { ...config.logicRegistry, variables: variables.map(v => v.id === variable.id ? { ...v, id: e.target.value.toUpperCase() } : v) } })} className="w-1/4 font-mono font-black text-blue-400 bg-surface-input p-2 rounded-lg outline-none border border-border-subtle" dir="ltr" />
                                    <input value={variable.label} onChange={e => updateConfig({ logicRegistry: { ...config.logicRegistry, variables: variables.map(v => v.id === variable.id ? { ...v, label: e.target.value } : v) } })} className="flex-1 font-bold text-txt-main bg-transparent outline-none" />
                                    <select value={variable.sourceKey} onChange={e => updateConfig({ logicRegistry: { ...config.logicRegistry, variables: variables.map(v => v.id === variable.id ? { ...v, sourceKey: e.target.value } : v) } })} className="w-1/3 text-xs p-2 bg-surface-input rounded-lg outline-none border border-border-subtle text-txt-secondary cursor-pointer">
                                        <option value="">-- اختر الحقل --</option>
                                        {availableBindings.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                    </select>
                                    <button onClick={() => updateConfig({ logicRegistry: { ...config.logicRegistry, variables: variables.filter(v => v.id !== variable.id) } })} className="text-txt-muted hover:text-red-400 p-2"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* System Constants Section */}
                    <section className="space-y-6 pt-10 border-t border-border-subtle">
                        <div>
                            <h3 className="font-black text-txt-main text-lg flex items-center gap-2"><Hash size={20} className="text-amber-500" /> الثوابت العامة (Global Constants)</h3>
                            <p className="text-xs text-txt-secondary">قيم ثابتة لا تتغير بتغير السجلات (مثل نسبة الضريبة 0.15 أو هامش الربح).</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(constants).map(([k, v]) => (
                                <div key={k} className="glass-card p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between group hover:border-amber-500/30 transition-all bg-surface-card">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg font-mono font-black text-xs border border-amber-500/20">{k}</div>
                                        <input value={String(v)} onChange={e => updateConfig({ systemConstants: { ...constants, [k]: e.target.value } })} className="text-sm font-black text-txt-main w-24 outline-none border-b border-transparent focus:border-amber-500 bg-transparent" />
                                    </div>
                                    <button onClick={() => { const next = { ...constants }; delete next[k]; updateConfig({ systemConstants: next }); }} className="text-txt-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <div className="bg-surface-input p-4 rounded-2xl border-2 border-dashed border-border-subtle flex gap-2">
                                <input value={newConstKey} onChange={e => setNewConstKey(e.target.value.toUpperCase())} placeholder="اسم الثابت (TAX)" className="w-1/3 p-2 text-xs border border-border-subtle rounded-lg outline-none font-mono bg-surface-card text-txt-main" />
                                <input value={newConstVal} onChange={e => setNewConstVal(e.target.value)} placeholder="القيمة (0.15)" className="flex-1 p-2 text-xs border border-border-subtle rounded-lg outline-none font-black bg-surface-card text-txt-main" />
                                <button onClick={handleAddConstant} disabled={!newConstKey} className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-500 transition-colors"><Plus size={18}/></button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'formulas' && (
                <div className="space-y-8 animate-fade-in">
                    {formulas.map(formula => {
                        // Fix: Using LogicEngineService sanitization logic for simple check
                        const isValid = !/[^a-zA-Z0-9_+\-*/%().,\s]/.test(formula.expression);
                        return (
                            <div key={formula.id} className={`glass-card rounded-[40px] border p-8 shadow-sm group relative overflow-hidden transition-all hover:shadow-2xl bg-surface-card ${isValid ? 'border-border-subtle' : 'border-red-500/30'}`}>
                                <div className="flex flex-col lg:flex-row gap-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <input type="text" value={formula.label} onChange={e => handleUpdateFormula(formula.id, { label: e.target.value })} className="text-2xl font-black text-txt-main outline-none border-b-2 border-transparent focus:border-blue-500 bg-transparent" />
                                            <div className="flex bg-surface-input p-1 rounded-xl">
                                                <button onClick={() => handleUpdateFormula(formula.id, { scope: 'row' })} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${formula.scope !== 'aggregate' ? 'bg-surface-card text-blue-400 shadow-sm' : 'text-txt-muted'}`}>سطر (Row)</button>
                                                <button onClick={() => handleUpdateFormula(formula.id, { scope: 'aggregate' })} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${formula.scope === 'aggregate' ? 'bg-surface-card text-purple-400 shadow-sm' : 'text-txt-muted'}`}>تجميعي (Agg)</button>
                                            </div>
                                            <button onClick={() => updateConfig({ logicRegistry: { ...config.logicRegistry, formulas: formulas.filter(f => f.id !== formula.id) } })} className="text-txt-muted hover:text-red-400"><Trash2 size={20}/></button>
                                        </div>
                                        <textarea value={formula.expression} onChange={e => handleUpdateFormula(formula.id, { expression: e.target.value })} className="w-full font-mono text-lg bg-surface-app text-emerald-400 p-8 rounded-[30px] outline-none border border-border-subtle focus:border-emerald-500/30" dir="ltr" rows={2} />
                                        <div className="flex flex-wrap gap-2 p-4 bg-surface-input rounded-2xl border border-border-subtle">
                                            {variables.map(v => <button key={v.id} onClick={() => insertToFormula(formula.id, v.id)} className="px-3 py-1 bg-surface-card border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 hover:bg-blue-600 hover:text-white transition-all">{v.label}</button>)}
                                            {Object.keys(constants).map(k => <button key={k} onClick={() => insertToFormula(formula.id, k)} className="px-3 py-1 bg-surface-card border border-amber-500/20 rounded-lg text-[10px] font-black text-amber-400 hover:bg-amber-600 hover:text-white transition-all">{k}</button>)}
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-72 bg-blue-500/5 rounded-[40px] p-8 border border-blue-500/10 flex flex-col justify-center text-center">
                                        <span className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest">فحص المنطق</span>
                                        <div className="text-4xl font-black tabular-nums text-blue-500">{solvePreview(formula).toLocaleString()}</div>
                                        <input type="range" min="1" max="1000" value={testValue} onChange={e => setTestValue(Number(e.target.value))} className="w-full mt-6 h-1.5 bg-blue-500/20 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                        <p className="text-[9px] text-txt-muted mt-2">اختبار بمتغير = {testValue}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <Button variant="secondary" onClick={handleAddFormula} className="w-full py-10 border-dashed border-4 border-border-subtle rounded-[40px] text-xl font-black text-txt-muted hover:text-blue-400 hover:border-blue-500/30 transition-all bg-transparent">إنشاء معادلة جديدة</Button>
                </div>
            )}

            {activeTab === 'direction' && (
                <section className="space-y-8 animate-fade-in-up">
                    <div className="bg-purple-500/10 p-8 rounded-[40px] border border-purple-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 text-purple-500"><ArrowRightLeft size={120} /></div>
                        <div className="relative z-10 max-w-2xl">
                            <h3 className="text-2xl font-black text-purple-300 mb-2">منطق الاتجاه الحسابي (Direction Logic)</h3>
                            <p className="text-sm text-purple-200/80 leading-relaxed">أهم إعداد في النظام؛ يحدد كيف يتعامل المحرك مع أنواع السجلات. اختر البُعد الذي يمنح السجل إشارته (موجب/سالب) لضمان دقة التجميع التلقائي.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="glass-card p-6 rounded-3xl border border-border-subtle shadow-sm space-y-4 bg-surface-card">
                            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">البُعد القائد للاتجاه</label>
                            <select value={directionDimId} onChange={e => handleUpdateDirectionDim(e.target.value)} className="w-full p-4 bg-surface-input border border-border-subtle rounded-2xl text-sm font-black outline-none focus:border-purple-500 text-txt-main cursor-pointer">
                                <option value="">-- اختر البُعد --</option>
                                {dimensions.filter(d => d.enabled && (d.type === 'master_data' || d.type === 'list' || d.type === 'text')).map(d => (
                                    <option key={d.id} value={d.id}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:col-span-2 glass-card rounded-3xl border border-border-subtle shadow-sm overflow-hidden flex flex-col bg-surface-card">
                            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
                                {!directionDimId ? (
                                    <div className="py-20 text-center text-txt-muted italic text-sm">يرجى اختيار البُعد من اليمين</div>
                                ) : directionProviderValues.map(val => (
                                    <div key={val.id} className="flex items-center justify-between p-4 bg-surface-input/50 rounded-2xl border border-transparent hover:border-purple-500/20 hover:bg-surface-input transition-all group">
                                        <span className="text-sm font-black text-txt-main">{val.label}</span>
                                        <div className="flex bg-black/20 p-1 rounded-xl">
                                            <DirectionToggle active={directionLogic[val.id] === 'positive'} onClick={() => handleUpdateDirectionValue(val.id, 'positive')} icon={Plus} label="إضافة (+)" color="green" />
                                            <DirectionToggle active={directionLogic[val.id] === 'negative'} onClick={() => handleUpdateDirectionValue(val.id, 'negative')} icon={MinusCircle} label="خصم (-)" color="red" />
                                            <DirectionToggle active={!directionLogic[val.id] || directionLogic[val.id] === 'neutral'} onClick={() => handleUpdateDirectionValue(val.id, 'neutral')} icon={CircleDashed} label="محايد (0)" color="slate" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <SettingHelpBlock title="لماذا هذه التعقيدات؟" description="البيانات الخام صامتة ولا تملك معنى. في هذا المختبر، أنت تعلم المحرك: ما هي الحقول الرقمية؟ وكيف يحسب الضرائب؟ ومتى يطرح المبالغ؟ هذه القوانين هي التي تحول ملف Excel عادي إلى منظومة ذكاء أعمال." onClick={() => setShowHelp(true)} color="blue" />
        </div>
    );
};

const DirectionToggle = ({ active, onClick, icon: Icon, label, color }: any) => {
    const colors: any = {
        green: active ? 'bg-green-600 text-white shadow-lg' : 'text-txt-muted hover:text-green-400',
        red: active ? 'bg-red-600 text-white shadow-lg' : 'text-txt-muted hover:text-red-400',
        slate: active ? 'bg-slate-600 text-white shadow-lg' : 'text-txt-muted hover:text-slate-300'
    };
    return (
        <button onClick={onClick} className={`px-4 py-2 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all ${colors[color]}`}>
            <Icon size={14} />
            <span className="hidden md:inline">{label}</span>
        </button>
    );
};
