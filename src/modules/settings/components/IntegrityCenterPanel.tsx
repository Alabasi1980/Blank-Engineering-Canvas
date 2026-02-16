
import React, { useState } from 'react';
import { 
    ShieldCheck, Award, Fingerprint, GitMerge, Lock, CheckCircle2, AlertTriangle, Search
} from 'lucide-react';
import { useCompany } from '../../../context/CompanyContext';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';
import { SettingHelpBlock } from './system/SettingHelpBlock';
import { GenericGuideModal } from './system/GenericGuideModal';

export const IntegrityCenterPanel: React.FC = () => {
    const { config } = useCompany();
    const [showHelp, setShowHelp] = useState(false);
    
    const sources = config.dataSources || [];
    const perfectSources = sources.filter(s => !!s.primaryKeyField && s.updateStrategy === 'upsert' && s.mapping && Object.keys(s.mapping).length > 0).length;
    const integrityScore = sources.length > 0 ? Math.round((perfectSources / sources.length) * 100) : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10 h-full flex flex-col">
            <SettingsSectionHeader 
                title="رادار النزاهة والتدقيق"
                description="مراقبة مدى التزام مصادر البيانات بـ 'دستور البيانات' وضمان خلو التقارير من التكرار أو التداخل."
                icon={ShieldCheck}
                bgClass="bg-indigo-500/10"
                iconColorClass="text-indigo-400"
            />

            <div className="glass-card rounded-[3rem] p-8 relative overflow-hidden shadow-2xl border border-indigo-500/30 bg-surface-card group">
                <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500 shadow-[0_0_20px_#6366f1]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest">
                            <Award size={14}/> مستوى الثقة الكلي
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight text-txt-main">صحة التقارير التنفيذية</h2>
                        <p className="text-txt-secondary text-sm max-w-xl leading-relaxed">
                            هذه الدرجة تعكس مدى انضباط مصادر البيانات. الدرجة العالية تعني أن كافة الأرقام تمر عبر "فلتر الدستور" لمنع التكرار وضمان هوية فريدة لكل سجل مالي.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface-input" />
                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                    className={`${integrityScore > 80 ? 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'} transition-all duration-1000`}
                                    strokeDasharray={502.4} strokeDashoffset={502.4 - (502.4 * integrityScore) / 100} strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-5xl font-black tabular-nums text-txt-main">{integrityScore}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] border border-border-subtle shadow-xl overflow-hidden flex flex-col bg-surface-card">
                <div className="px-8 py-6 border-b border-border-subtle bg-surface-overlay flex justify-between items-center font-black text-txt-muted uppercase tracking-tight">
                    فحص امتثال الحاويات (Container Compliance Audit)
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-surface-input text-txt-muted text-[10px] font-black uppercase tracking-widest border-b border-border-subtle">
                            <tr>
                                <th className="px-8 py-4">اسم الحاوية</th>
                                <th className="px-8 py-4">المفتاح (PK)</th>
                                <th className="px-8 py-4">الاستراتيجية</th>
                                <th className="px-8 py-4">المطابقة (Mapping)</th>
                                <th className="px-8 py-4 text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {sources.map(source => (
                                <tr key={source.id} className="hover:bg-surface-overlay transition-colors">
                                    <td className="px-8 py-5 font-bold text-txt-main">{source.label}</td>
                                    <td className="px-8 py-5">
                                        {source.primaryKeyField ? (
                                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold"><Fingerprint size={14}/> معرف فريد</span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><AlertTriangle size={14}/> مفقود</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 font-mono text-[10px] text-txt-secondary uppercase">{source.updateStrategy}</td>
                                    <td className="px-8 py-5 text-txt-secondary">{(source.mapping && Object.keys(source.mapping).length > 0) ? 'مكتمل' : 'يدوي'}</td>
                                    <td className="px-8 py-5 text-center">
                                        <div className={`w-3 h-3 rounded-full mx-auto ${source.primaryKeyField && source.mapping ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'}`}></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SettingHelpBlock 
                title="لماذا نهتم بالنزاهة؟"
                description="لوحة القيادة تكون مضللة إذا تم استيراد نفس الفاتورة مرتين. نظام النزاهة يراقب 'البصمة الفريدة' لكل سجل لمنع الأخطاء الحسابية الناتجة عن تكرار البيانات."
                onClick={() => setShowHelp(true)}
                color="indigo"
            />
        </div>
    );
};
