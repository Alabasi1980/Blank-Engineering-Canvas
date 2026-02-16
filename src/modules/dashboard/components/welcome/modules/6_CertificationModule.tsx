
import React from 'react';
import { Award } from 'lucide-react';
import { ModuleContentProps } from '../types';

export const CertificationModule: React.FC<ModuleContentProps> = () => {
    return (
        <div className="text-center space-y-8 py-6 animate-fade-in-up">
            <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-amber-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center relative shadow-2xl shadow-amber-500/20 border-4 border-surface-card">
                    <Award size={64} className="text-white drop-shadow-md" />
                </div>
            </div>
            
            <div>
                <h3 className="text-3xl font-black text-txt-main mb-3 tracking-tight">أنت الآن مهندس ذكاء تنفيذي!</h3>
                <p className="text-txt-secondary text-sm max-w-sm mx-auto leading-relaxed">
                    لقد أتممت الرحلة المعرفية بنجاح. أنت الآن تملك الأدوات اللازمة لتحويل أي نوع من البيانات إلى منظومة تقارير ذكية وعالية الدقة.
                </p>
            </div>

            <div className="bg-surface-card p-6 rounded-3xl border border-border-subtle text-xs text-txt-muted mx-auto max-w-md text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-surface-input"></div>
                <strong className="block text-txt-main mb-2 text-sm">خارطة طريق البدء:</strong>
                <ol className="list-decimal list-inside space-y-2 pr-2">
                    <li>اذهب إلى <strong>إعدادات النظام</strong> واضبط العملة والبارامترات العامة.</li>
                    <li>قم بتعريف <strong>الأبعاد</strong> التي يتكون منها نظامك.</li>
                    <li>ابدأ بـ <strong>استيراد البيانات</strong> لبناء القوائم المرجعية والبدء في التحليل.</li>
                </ol>
            </div>
        </div>
    );
};
