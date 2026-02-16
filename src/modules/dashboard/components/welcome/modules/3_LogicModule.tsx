
import React, { useState } from 'react';
import { ArrowLeftRight, Binary, PlayCircle } from 'lucide-react';
import { ModuleContentProps } from '../types';

const InteractiveSimulator = () => {
    const [docType, setDocType] = useState('positive');
    const amount = 1000;
    const effect = docType === 'positive' ? 1 : -1;
    const final = amount * effect;

    return (
        <div className="bg-surface-card text-white p-5 rounded-2xl shadow-lg border border-border-subtle font-mono text-xs my-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Binary size={80}/></div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4 relative z-10">
                <div className="flex-1 w-full">
                    <label className="block text-blue-300 font-bold mb-1.5 text-[10px] uppercase tracking-widest">1. محدد الاتجاه (Direction Provider)</label>
                    <select 
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="bg-surface-input border border-border-subtle rounded-xl px-3 py-3 w-full text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                        <option value="positive">تأثير تراكمي (إضافة +)</option>
                        <option value="negative">تأثير عكسي (استقطاع -)</option>
                    </select>
                </div>
                <div className="text-center pt-4 md:pt-6">
                    <ArrowLeftRight size={24} className="text-txt-muted" />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-emerald-300 font-bold mb-1.5 text-[10px] uppercase tracking-widest">2. الناتج المعالج (Engine Value)</label>
                    <div className={`px-3 py-3 rounded-xl font-bold text-center border text-lg transition-all duration-300 ${final < 0 ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}>
                        {final > 0 ? '+' : ''}{final.toLocaleString()}
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-txt-secondary border-t border-border-subtle pt-3 leading-relaxed relative z-10">
                <strong className="text-white">قانون الاتجاه:</strong> النظام لا يفترض معاني مسبقة للبيانات. أنت من يحدد "البُعد" الذي يمنح السجل إشارته الحسابية. هذا التجريد يسمح لك بحساب الأوزان، الساعات، أو الكميات بنفس دقة المبالغ المالية.
            </p>
        </div>
    );
};

export const LogicModule: React.FC<ModuleContentProps> = ({ onAction }) => {
    return (
        <div className="space-y-6 text-sm text-txt-secondary leading-relaxed animate-fade-in-up">
            <p>
                يكمن ذكاء المحرك في قدرته على توحيد إشارات البيانات القادمة من مصادر مختلفة بناءً على <strong>قواعد الاتجاه</strong> التي تصممها بنفسك.
            </p>
            
            <InteractiveSimulator />

            <div className="space-y-3 pt-2">
                <h4 className="font-bold text-txt-main">أساليب المعالجة الحسابية:</h4>
                <ul className="space-y-2">
                    <li className="flex gap-3 items-start p-2 hover:bg-surface-input rounded-lg transition-colors border border-transparent hover:border-border-subtle">
                        <div className="mt-1 min-w-[20px]"><span className="bg-purple-500/20 text-purple-400 text-[10px] font-black px-1.5 rounded border border-purple-500/20">UNIT</span></div>
                        <div>
                            <strong className="text-txt-main block">المعالجة الخطية (Row Context):</strong>
                            <span className="text-xs">تتم داخل كل سجل بيانات بشكل مستقل. مثال: <code>(القيمة * المعامل) - نسبة الهدر</code>.</span>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start p-2 hover:bg-surface-input rounded-lg transition-colors border border-transparent hover:border-border-subtle">
                        <div className="mt-1 min-w-[20px]"><span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-1.5 rounded border border-blue-500/20">TOTAL</span></div>
                        <div>
                            <strong className="text-txt-main block">المعالجة التجميعية (Global Context):</strong>
                            <span className="text-xs">تتم على النتائج النهائية في التقارير. مثال: <code>SUM(الناتج) / COUNT(السجلات)</code>.</span>
                        </div>
                    </li>
                </ul>
            </div>

            {onAction && (
                <div className="flex justify-center pt-2">
                    <button onClick={() => onAction('system_settings')} className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-purple-500 flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95">
                        <PlayCircle size={14}/> فتح مختبر المنطق (Logic Architect)
                    </button>
                </div>
            )}
        </div>
    );
};
