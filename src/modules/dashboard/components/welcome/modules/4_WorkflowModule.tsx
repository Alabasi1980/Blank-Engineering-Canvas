
import React from 'react';
import { Workflow } from 'lucide-react';
import { ModuleContentProps } from '../types';

export const WorkflowModule: React.FC<ModuleContentProps> = () => {
    return (
        <div className="space-y-6 text-sm text-txt-secondary leading-relaxed animate-fade-in-up">
            <div className="flex items-center gap-4 py-6 px-2 justify-center">
                <Step number={1} label="المسودة" color="amber" />
                <Line />
                <Step number={2} label="المحاكاة" color="blue" />
                <Line />
                <Step number={3} label="النشر" color="green" />
            </div>

            <ul className="space-y-4">
                <li className="bg-surface-card p-4 rounded-xl border border-amber-500/30 shadow-sm flex gap-4">
                    <div className="text-2xl">🚧</div>
                    <div>
                        <strong className="text-amber-400 block mb-1">بيئة التطوير (Sandbox/Draft):</strong>
                        عندما تغير أي إعداد، يتحول النظام لوضع "المسودة". أنت فقط من يرى التغييرات. لوحة القيادة التنفيذية تظل مستقرة على آخر نسخة معتمدة.
                    </div>
                </li>
                <li className="bg-surface-card p-4 rounded-xl border border-blue-500/30 shadow-sm flex gap-4">
                    <div className="text-2xl">🧪</div>
                    <div>
                        <strong className="text-blue-400 block mb-1">المحاكي (The Simulator):</strong>
                        قبل اعتماد التغييرات، يمكنك اختبار أي قاعدة جديدة على سجل بيانات حقيقي للتأكد من أن الناتج يطابق توقعاتك بدقة.
                    </div>
                </li>
                <li className="bg-surface-card p-4 rounded-xl border border-emerald-500/30 shadow-sm flex gap-4">
                    <div className="text-2xl">🚀</div>
                    <div>
                        <strong className="text-emerald-400 block mb-1">الاعتماد والنشر (Publishing):</strong>
                        عند النشر، يتم أخذ "لقطة نظام" (Snapshot) كاملة. في حال حدوث أي خطأ، يمكنك العودة فوراً لأي نسخة سابقة ناجحة.
                    </div>
                </li>
            </ul>
        </div>
    );
};

const Step = ({ number, label, color }: any) => {
    const colors: any = {
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    };
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${colors[color]}`}>{number}</div>
            <span className="text-xs font-bold text-txt-muted">{label}</span>
        </div>
    );
};

const Line = () => <div className="w-16 h-1 bg-surface-input rounded-full mt-[-20px]"></div>;
