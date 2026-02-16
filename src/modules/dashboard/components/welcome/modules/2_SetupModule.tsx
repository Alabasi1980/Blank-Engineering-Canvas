
import React from 'react';
import { Database, PlayCircle } from 'lucide-react';
import { ModuleContentProps } from '../types';

export const SetupModule: React.FC<ModuleContentProps> = ({ onAction }) => {
    return (
        <div className="space-y-6 text-sm text-txt-secondary leading-relaxed animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-card border border-border-subtle p-5 rounded-2xl shadow-sm hover:border-blue-500/30 transition-colors group">
                    <strong className="block text-blue-400 mb-2 text-base group-hover:translate-x-1 transition-transform">أ. الأبعاد (Dimensions)</strong>
                    <p className="text-xs mb-3 text-txt-muted">هي "الملصقات" أو "السمات" التي تميز السجلات عن بعضها.</p>
                    <ul className="text-xs list-disc list-inside text-txt-secondary space-y-1 bg-surface-input p-3 rounded-lg border border-border-subtle">
                        <li>الفئة الوظيفية (Category)</li>
                        <li>الحالة التشغيلية (Status)</li>
                        <li>جهة الصدور (Source)</li>
                    </ul>
                </div>
                <div className="bg-surface-card border border-border-subtle p-5 rounded-2xl shadow-sm hover:border-purple-500/30 transition-colors group">
                    <strong className="block text-purple-400 mb-2 text-base group-hover:translate-x-1 transition-transform">ب. القوائم المرجعية (Master Data)</strong>
                    <p className="text-xs mb-3 text-txt-muted">هي "الهياكل الثابتة" التي تربط بها حركاتك المتغيرة.</p>
                    <ul className="text-xs list-disc list-inside text-txt-secondary space-y-1 bg-surface-input p-3 rounded-lg border border-border-subtle">
                        <li>هيكلية التصنيف (Group {'>'} Item)</li>
                        <li>الهيكل التنظيمي (Parent {'>'} Child)</li>
                    </ul>
                </div>
            </div>

            <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20 flex gap-4 items-start">
                <div className="bg-surface-card p-2 rounded-lg text-blue-400 shadow-sm"><Database size={20}/></div>
                <div>
                    <h4 className="font-bold text-blue-300 mb-2">قوة النزاهة الهيكلية (Hierarchical Integrity)</h4>
                    <p className="text-xs text-blue-200/80 leading-6 mb-3">
                        بمجرد بناء شجرة البيانات، سيفهم المحرك تلقائياً تجميع السجلات. عندما تختار "عنصر أب"، سيتم جلب كافة بيانات "الأبناء" في التقارير دون الحاجة لتعريف ذلك يدوياً في كل مرة.
                    </p>
                    {onAction && (
                        <button onClick={() => onAction('system_settings')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 flex items-center gap-1 transition-colors shadow-sm">
                            <PlayCircle size={12}/> البدء في تصميم الهيكلية
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
