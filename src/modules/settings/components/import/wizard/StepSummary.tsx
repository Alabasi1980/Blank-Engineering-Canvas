
import React, { useState } from 'react';
import { CheckCircle2, ListFilter, PlusCircle, RefreshCw, XCircle, ShieldCheck, CopyMinus, Bookmark, Save } from 'lucide-react';
import { ImportStats } from '../../../hooks/useImportWizard';
import { Button } from '../../../../../shared/components/Button';
import { useUI } from '../../../../../context/UIContext';

interface StepSummaryProps {
    stats: ImportStats | null;
    sourceLabel: string;
    onFinish: () => void;
    onSaveProfile?: (name: string) => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({ stats, sourceLabel, onFinish, onSaveProfile }) => {
    const { showToast } = useUI();
    const [profileName, setProfileName] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    if (!stats) return null;

    const hasRejects = stats.rejectedDuplicates > 0 || stats.invalidRows > 0;

    const handleSaveProfile = () => {
        if (!profileName.trim()) return;
        if (onSaveProfile) {
            onSaveProfile(profileName);
            setIsSavingProfile(true);
            showToast('تم حفظ البروفايل بنجاح');
        }
    };

    return (
        <div className="glass-card p-10 rounded-[2.5rem] border border-border-subtle shadow-2xl flex flex-col items-center text-center animate-fade-in-up max-w-3xl mx-auto relative overflow-hidden bg-surface-card">
            
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50"></div>
            
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500 rounded-full scale-150 blur-3xl opacity-20 animate-pulse"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full flex items-center justify-center relative shadow-neon border-4 border-surface-card ring-4 ring-emerald-500/20">
                    <CheckCircle2 size={40} strokeWidth={3} />
                </div>
            </div>

            <h3 className="text-2xl font-black text-txt-main mb-2 tracking-tight">تمت العملية بنجاح!</h3>
            <p className="text-txt-secondary mb-10 text-sm">تم تطبيق دستور البيانات على المصدر <span className="font-bold text-txt-main bg-surface-input px-2 py-0.5 rounded mx-1 border border-border-subtle">{sourceLabel}</span></p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
                <StatCard 
                    icon={ListFilter} label="إجمالي الملف" 
                    value={stats.totalFileRows} 
                    color="text-txt-secondary" bg="bg-surface-input" border="border-border-subtle"
                />
                <StatCard 
                    icon={PlusCircle} label="تمت إضافتها" 
                    value={stats.newRecords} 
                    color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20"
                />
                <StatCard 
                    icon={RefreshCw} label="تم تحديثها" 
                    value={stats.updatedRecords} 
                    color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20"
                />
                <StatCard 
                    icon={CopyMinus} label="متطابقة (تجاهل)" 
                    value={stats.identicalRecords} 
                    color="text-txt-muted" bg="bg-surface-input" border="border-border-subtle"
                />
            </div>

            {hasRejects && (
                <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 text-right flex items-start gap-4">
                    <div className="p-2 bg-red-500/20 text-red-400 rounded-lg shrink-0"><XCircle size={20}/></div>
                    <div>
                        <h4 className="text-sm font-bold text-red-300 mb-1">تم استبعاد بعض السجلات</h4>
                        <p className="text-xs text-red-400/80 leading-relaxed">
                            لحماية نزاهة البيانات، تم رفض <strong>{stats.invalidRows}</strong> سطر بسبب بيانات غير صالحة، 
                            و <strong>{stats.rejectedDuplicates}</strong> سطر مكرر. يمكنك مراجعة الملف المرفوض الذي تم إنشاؤه في الخطوة السابقة.
                        </p>
                    </div>
                </div>
            )}

            {/* Mission 3.2: Save as Profile Section */}
            {onSaveProfile && !isSavingProfile && (
                <div className="w-full max-w-md bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 mb-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <Bookmark size={14} />
                        <span>هل تود حفظ هذه الإعدادات للاستخدام المستقبلي؟</span>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)} 
                            placeholder="اسم البروفايل (مثلاً: استيراد المبيعات الشهري)"
                            className="flex-1 text-xs p-2.5 rounded-xl border border-amber-500/30 outline-none focus:border-amber-500 bg-surface-app text-txt-main placeholder-txt-muted"
                        />
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={!profileName.trim()}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1 shadow-lg shadow-amber-900/20"
                        >
                            <Save size={14} /> حفظ
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 w-full max-w-sm">
                <Button 
                    onClick={onFinish}
                    className="w-full py-4 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    العودة لمركز البيانات
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-txt-muted mt-2">
                    <ShieldCheck size={12} />
                    <span>تم حفظ نسخة احتياطية (Undo Available)</span>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bg, border }: any) => (
    <div className={`${bg} p-4 rounded-2xl border ${border} flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105`}>
        <Icon size={20} className={`${color} mb-1 opacity-80`} />
        <span className={`text-2xl font-black ${color} tabular-nums`}>{value.toLocaleString()}</span>
        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">{label}</span>
    </div>
);
