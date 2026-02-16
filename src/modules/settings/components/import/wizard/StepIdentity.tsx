
import React, { useState } from 'react';
import { ShieldCheck, FileText, Globe, RefreshCw, GitMerge, CopyPlus, CheckCircle, Database, ScanEye, Bookmark, Plus } from 'lucide-react';
import { UpdateStrategy, DataSourceConfigItem, ImportProfile } from '../../../../../types';
import { Button } from '../../../../../shared/components/Button';

interface StepIdentityProps {
    label: string;
    onLabelChange: (val: string) => void;
    targetMode: 'new' | 'existing';
    onTargetModeChange: (val: 'new' | 'existing') => void;
    existingSourceId: string;
    onExistingSourceChange: (val: string) => void;
    existingSources: DataSourceConfigItem[];
    strategy: UpdateStrategy | 'validation';
    onStrategyChange: (val: any) => void;
    sourceType: 'file' | 'api';
    onSourceTypeChange: (val: 'file' | 'api') => void;
    onNext: () => void;
    importProfiles?: ImportProfile[];
    onLoadProfile?: (id: string) => void;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({ 
    label, onLabelChange, targetMode, onTargetModeChange, 
    existingSourceId, onExistingSourceChange, existingSources,
    strategy, onStrategyChange, sourceType, onSourceTypeChange, onNext,
    importProfiles = [], onLoadProfile
}) => {
    const [selectedProfileId, setSelectedProfileId] = useState('');
    
    const isSourceDefined = (targetMode === 'new' && label.trim().length > 0) || (targetMode === 'existing' && existingSourceId);
    
    // Updated Glassy Styles
    const activeRing = "border-primary-500/50 bg-primary-500/10 shadow-neon";
    const inactiveBorder = "border-border-subtle bg-surface-card hover:bg-surface-overlay hover:border-border-highlight";

    const handleProfileSelect = (id: string) => {
        setSelectedProfileId(id);
        if (id && onLoadProfile) onLoadProfile(id);
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-10 max-w-5xl mx-auto text-txt-main">
            {/* Header Section */}
            <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-black text-txt-main tracking-tight">1. وجهة البيانات وقواعد النزاهة</h3>
                <p className="text-sm text-txt-secondary max-w-lg mx-auto">
                    حدد الحاوية المستهدفة وكيفية التعامل مع البيانات الجديدة.
                </p>
            </div>

            {/* Profiles Loader */}
            {importProfiles.length > 0 && (
                <div className="glass-card p-4 flex items-center justify-between mb-6 shadow-sm border border-amber-500/20 bg-amber-500/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg"><Bookmark size={18}/></div>
                        <div>
                            <h4 className="font-bold text-amber-200 text-sm">استدعاء بروفايل محفوظ</h4>
                            <p className="text-xs text-amber-400/70">تحميل إعدادات محفوظة مسبقاً.</p>
                        </div>
                    </div>
                    <select 
                        value={selectedProfileId}
                        onChange={(e) => handleProfileSelect(e.target.value)}
                        className="bg-surface-input border border-amber-500/30 text-amber-100 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:border-amber-500 cursor-pointer min-w-[200px]"
                    >
                        <option value="">-- اختر بروفايل --</option>
                        {importProfiles.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* 1. Target Container Selection */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-txt-muted uppercase tracking-widest px-2">
                    <span className="bg-surface-input text-txt-muted w-5 h-5 rounded-full flex items-center justify-center border border-border-subtle">1</span>
                    اختر الحاوية المستهدفة (Destination)
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => onTargetModeChange('new')}
                        className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group ${targetMode === 'new' ? activeRing : inactiveBorder}`}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl transition-colors ${targetMode === 'new' ? 'bg-primary-600 text-white shadow-lg' : 'bg-surface-input text-txt-muted'}`}>
                                <Plus size={24} />
                            </div>
                            {targetMode === 'new' && <CheckCircle className="text-primary-400" size={20} />}
                        </div>
                        <div>
                            <h4 className={`font-bold text-lg ${targetMode === 'new' ? 'text-txt-main' : 'text-txt-secondary'}`}>حاوية جديدة (New Source)</h4>
                            <p className="text-xs text-txt-muted mt-1">إنشاء سجل مستقل جديد تماماً لاستقبال البيانات.</p>
                        </div>
                        
                        {targetMode === 'new' && (
                            <div className="mt-2 animate-fade-in">
                                <label className="text-[10px] font-bold text-primary-400 mb-1 block">اسم المصدر الجديد</label>
                                <input 
                                    type="text" 
                                    value={label} 
                                    onChange={e => onLabelChange(e.target.value)}
                                    placeholder="مثال: مبيعات الربع الأول 2024"
                                    className="input-fantasy w-full px-4 py-3 text-sm font-bold shadow-inner"
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        )}
                    </div>

                    <div 
                        onClick={() => { if(existingSources.length > 0) onTargetModeChange('existing'); }}
                        className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden ${targetMode === 'existing' ? "border-purple-500/50 bg-purple-500/10 shadow-neon" : inactiveBorder} ${existingSources.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl transition-colors ${targetMode === 'existing' ? 'bg-purple-600 text-white shadow-lg' : 'bg-surface-input text-txt-muted'}`}>
                                <Database size={24} />
                            </div>
                            {targetMode === 'existing' && <CheckCircle className="text-purple-400" size={20} />}
                        </div>
                        <div>
                            <h4 className={`font-bold text-lg ${targetMode === 'existing' ? 'text-txt-main' : 'text-txt-secondary'}`}>حاوية موجودة (Existing)</h4>
                            <p className="text-xs text-txt-muted mt-1">إضافة بيانات جديدة أو تحديث بيانات سابقة في مصدر موجود.</p>
                        </div>

                        {targetMode === 'existing' && (
                            <div className="mt-2 animate-fade-in">
                                <label className="text-[10px] font-bold text-purple-400 mb-1 block">اختر المصدر</label>
                                <select 
                                    value={existingSourceId} 
                                    onChange={e => onExistingSourceChange(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    className="input-fantasy w-full px-4 py-3 text-sm font-bold shadow-inner cursor-pointer"
                                >
                                    <option value="">-- اختر من القائمة --</option>
                                    {existingSources.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 2. Source Type */}
            <div className={`transition-all duration-500 ease-in-out ${isSourceDefined ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4 pointer-events-none grayscale'}`}>
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-txt-muted uppercase tracking-widest px-2">
                        <span className="bg-surface-input text-txt-muted w-5 h-5 rounded-full flex items-center justify-center border border-border-subtle">2</span>
                        نوع الملف أو الاتصال
                    </div>
                    <div className="flex gap-4">
                        <SourceBtn active={sourceType === 'file'} icon={FileText} label="ملف Excel / CSV" subLabel="رفع يدوي" onClick={() => onSourceTypeChange('file')} />
                        <SourceBtn active={sourceType === 'api'} icon={Globe} label="رابط API حي" subLabel="مزامنة تلقائية" onClick={() => onSourceTypeChange('api')} />
                    </div>
                </section>

                {/* 3. Strategy */}
                <section className="space-y-4 mt-8 pt-8 border-t border-border-subtle">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-black text-txt-muted uppercase tracking-widest px-2">
                            <span className="bg-surface-input text-txt-muted w-5 h-5 rounded-full flex items-center justify-center border border-border-subtle">3</span>
                            دستور التعامل مع البيانات (Strategy)
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StrategyCard 
                            active={strategy === 'upsert'} 
                            icon={GitMerge} 
                            title="دمج ذكي (Upsert)" 
                            desc="تحديث السجلات القديمة وإضافة الجديدة بناءً على المفتاح."
                            color="purple"
                            onClick={() => onStrategyChange('upsert')}
                        />
                        <StrategyCard 
                            active={strategy === 'append'} 
                            icon={CopyPlus} 
                            title="إلحاق (Append)" 
                            desc="إضافة الجديد فقط (سجلات تاريخية) ورفض المكرر."
                            color="amber"
                            onClick={() => onStrategyChange('append')}
                        />
                        <StrategyCard 
                            active={strategy === 'replace_all'} 
                            icon={RefreshCw} 
                            title="استبدال (Replace)" 
                            desc="حذف المحتوى السابق بالكامل ووضع البيانات الجديدة."
                            color="red"
                            onClick={() => onStrategyChange('replace_all')}
                        />
                        <StrategyCard 
                            active={strategy === 'validation'} 
                            icon={ScanEye} 
                            title="فحص (Dry Run)" 
                            desc="تجربة الاستيراد لمعرفة النتائج والأخطاء دون حفظ."
                            color="blue"
                            onClick={() => onStrategyChange('validation')}
                        />
                    </div>
                </section>

                <div className="mt-10 flex justify-end">
                    <Button 
                        onClick={onNext} 
                        disabled={!isSourceDefined} 
                        size="lg" 
                        className="px-10 py-4 rounded-xl font-bold text-sm"
                        icon={<span className="ml-2">متابعة</span>}
                    >
                        الخطوة التالية
                    </Button>
                </div>
            </div>
        </div>
    );
};

const SourceBtn = ({ active, icon: Icon, label, subLabel, onClick }: any) => (
    <button 
        onClick={onClick} 
        className={`flex-1 flex items-center gap-4 p-4 rounded-xl border transition-all text-right ${active ? 'bg-primary-500/10 border-primary-500/50 shadow-neon' : 'bg-surface-card border-border-subtle hover:bg-surface-overlay hover:border-border-highlight'}`}
    >
        <div className={`p-3 rounded-full ${active ? 'bg-primary-600 text-white' : 'bg-surface-input text-txt-muted'}`}>
            <Icon size={20}/>
        </div>
        <div>
            <span className={`block font-bold text-sm ${active ? 'text-txt-main' : 'text-txt-secondary'}`}>{label}</span>
            <span className="text-[10px] text-txt-muted">{subLabel}</span>
        </div>
        {active && <div className="mr-auto text-primary-400"><CheckCircle size={18} /></div>}
    </button>
);

const StrategyCard = ({ active, icon: Icon, title, desc, onClick, color }: any) => {
    const colors: any = {
        purple: { active: 'border-purple-500 bg-purple-500/10', icon: 'text-purple-400', title: 'text-purple-100' },
        amber: { active: 'border-amber-500 bg-amber-500/10', icon: 'text-amber-400', title: 'text-amber-100' },
        red: { active: 'border-red-500 bg-red-500/10', icon: 'text-red-400', title: 'text-red-100' },
        blue: { active: 'border-blue-500 bg-blue-500/10', icon: 'text-blue-400', title: 'text-blue-100' },
    };
    
    const theme = colors[color];

    return (
        <div 
            onClick={onClick} 
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden ${active ? theme.active + ' shadow-neon scale-[1.02]' : 'bg-surface-card border-border-subtle hover:border-border-highlight hover:bg-surface-overlay'}`}
        >
            <div className="flex justify-between items-start">
                <div className={`flex items-center gap-2 mb-1 ${active ? theme.title : 'text-txt-muted'}`}>
                    <Icon size={20} className={active ? theme.icon : 'text-txt-muted'} />
                    <span className={`font-bold text-xs ${active ? 'text-txt-main' : ''}`}>{title}</span>
                </div>
                {active && <div className={`w-3 h-3 rounded-full ${color === 'purple' ? 'bg-purple-500' : color === 'amber' ? 'bg-amber-500' : color === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}></div>}
            </div>
            
            <p className="text-[10px] text-txt-muted leading-relaxed min-h-[40px]">{desc}</p>
        </div>
    );
};
