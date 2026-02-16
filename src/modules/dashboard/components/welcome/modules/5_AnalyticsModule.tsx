
import React from 'react';
import { PlayCircle, Target } from 'lucide-react';
import { ModuleContentProps } from '../types';

export const AnalyticsModule: React.FC<ModuleContentProps> = ({ onAction }) => {
    return (
        <div className="space-y-6 text-sm text-txt-secondary leading-relaxed animate-fade-in-up">
            <p>
                البطاقات السطحية تعطيك المؤشر الكلي، لكن <strong>محرك المصفوفات (Pivot Engine)</strong> يتيح لك تشريح البيانات من أي زاوية.
            </p>
            
            <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20 space-y-4">
                <h4 className="font-bold text-emerald-400 text-base flex items-center gap-2">
                    <Target size={18} /> القدرة على الاستقصاء (Multi-Dimensional Drilling)
                </h4>
                <p className="text-xs text-emerald-200/80 bg-surface-input p-3 rounded-lg italic border border-emerald-500/10">
                    "ما هو إجمالي ناتج (المعادلة أ) موزعةً على (البعد ب) لكل (وحدة زمنية ج)؟"
                </p>
                <div className="bg-surface-card p-4 rounded-xl border border-emerald-500/20 text-[10px] font-mono text-emerald-300 space-y-2 shadow-inner">
                    <div className="flex gap-2"><span className="text-txt-muted">1.</span> اختيار البطاقة المستهدفة.</div>
                    <div className="flex gap-2"><span className="text-txt-muted">2.</span> تفعيل "التحليل التجميعي" (Pivot).</div>
                    <div className="flex gap-2"><span className="text-txt-muted">3.</span> تعيين الصفوف (الأبعاد الهيكلية).</div>
                    <div className="flex gap-2"><span className="text-txt-muted">4.</span> تعيين الأعمدة (الأبعاد الزمنية أو الفئوية).</div>
                    <div className="flex gap-2"><span className="text-txt-muted">5.</span> إضافة "الأعمدة المشتقة" لحساب النسب المئوية لحظياً.</div>
                </div>
            </div>

            <div className="p-4 border-t border-border-subtle text-center">
                <p className="text-xs text-txt-muted mb-4 font-medium">
                    <strong>النزول للأعماق (Drill-down):</strong> كافة الرسوم البيانية في النظام تفاعلية؛ الضغط على أي عنصر يقوم بعزل سجلاته الأصلية فوراً للفحص الجنائي.
                </p>
                {onAction && (
                    <button onClick={() => onAction('dashboard')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black hover:bg-emerald-500 flex items-center gap-2 mx-auto transition-all shadow-lg active:scale-95 shadow-emerald-500/20">
                        <PlayCircle size={14}/> استكشاف بيئة التحليل الحية
                    </button>
                )}
            </div>
        </div>
    );
};
