
import React from 'react';
import { Network, Cpu, ArrowRight } from 'lucide-react';
import { ModuleContentProps } from '../types';

export const ConceptModule: React.FC<ModuleContentProps> = () => {
    return (
        <div className="space-y-6 text-sm text-txt-secondary leading-relaxed animate-fade-in-up">
            <div className="bg-surface-card border border-indigo-500/20 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-txt-main mb-3 flex items-center gap-2">
                    <Network size={18} className="text-indigo-400"/> 
                    تجاوز القوالب الجاهزة
                </h4>
                <p className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
                    الأنظمة التقليدية تُبنى حول "معنى" محدد للبيانات مبرمج مسبقاً. إذا أردت تغيير المنطق أو إضافة بُعد جديد لم يتوقعه المبرمج، ينهار النظام. في EIS، أنت من يصمم المعنى والهيكل.
                </p>
            </div>
            
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                <h4 className="font-bold text-txt-main mb-4 flex items-center gap-2">
                    <Cpu size={18} className="text-indigo-400"/> 
                    فلسفة "المعالج المجرد" (The Abstract Processor)
                </h4>
                <p className="mb-4 text-xs font-medium text-txt-muted">
                    هذا المحرك لا يرى مسميات وظيفية، بل يرى <b>"وحدات بيانات"</b> تمر عبر <b>"مصفوفة قوانين"</b>:
                </p>
                
                <div className="flex flex-col md:flex-row items-center gap-2 text-xs">
                    <div className="bg-surface-input p-3 rounded-lg border border-border-subtle text-center flex-1 w-full shadow-sm">
                        <strong className="block text-txt-muted mb-1 uppercase tracking-wider text-[9px]">المدخل الخام</strong>
                        وحدة سجل رقمية <br/> (Generic Unit)
                    </div>
                    <ArrowRight className="text-indigo-500/50 rotate-90 md:rotate-0" />
                    <div className="bg-indigo-600 text-white p-3 rounded-lg border border-indigo-500 text-center flex-1 w-full shadow-neon relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-pulse"></div>
                        <strong className="block text-indigo-200 mb-1 uppercase tracking-wider text-[9px]">منطق التكوين</strong>
                        المعاملات الرياضية <br/> والقواعد الشرطية
                    </div>
                    <ArrowRight className="text-indigo-500/50 rotate-90 md:rotate-0" />
                    <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg border border-emerald-500/20 text-center flex-1 w-full shadow-sm font-bold">
                        <strong className="block text-emerald-500 mb-1 uppercase tracking-wider text-[9px]">المخرج النهائي</strong>
                        مؤشر ذكاء أداء <br/> (KPI)
                    </div>
                </div>
            </div>
            
            <p className="font-bold text-txt-main border-t border-border-subtle pt-4 text-center italic">
                "أنت لا تملأ البيانات في قالبنا، أنت تشكل القالب حول بياناتك."
            </p>
        </div>
    );
};
