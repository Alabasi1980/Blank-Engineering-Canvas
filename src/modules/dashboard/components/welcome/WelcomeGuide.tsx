
import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, ArrowRight, Lightbulb, PlayCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import { GUIDE_MODULES } from './config';
import { ModuleId } from './types';

interface WelcomeGuideProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (view: 'dashboard' | 'settings' | 'system_settings') => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ isOpen, onClose, onNavigate }) => {
    const [activeModuleId, setActiveModuleId] = useState<ModuleId>('concept');
    const [completedModules, setCompletedModules] = useState<Set<ModuleId>>(new Set(['concept']));
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setExpanded(true); 
        }
    }, [isOpen]);

    const activeModule = GUIDE_MODULES.find(m => m.id === activeModuleId) || GUIDE_MODULES[0];
    const activeIndex = GUIDE_MODULES.findIndex(m => m.id === activeModuleId);

    // Dynamic Colors Helper
    const getTheme = (color: string) => {
        const themes: any = {
            indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
            blue: { bg: 'bg-blue-600', light: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
            purple: { bg: 'bg-purple-600', light: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
            amber: { bg: 'bg-amber-600', light: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
            emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
            slate: { bg: 'bg-slate-700', light: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
        };
        return themes[color] || themes.indigo;
    };

    const theme = getTheme(activeModule.color);

    const markComplete = (id: ModuleId) => {
        setCompletedModules(prev => new Set(prev).add(id));
    };

    const handleNext = () => {
        markComplete(activeModuleId);
        if (activeIndex < GUIDE_MODULES.length - 1) {
            setActiveModuleId(GUIDE_MODULES[activeIndex + 1].id);
        } else {
            onClose();
        }
    };

    const handleNavigateAction = (target: any) => {
        if (onNavigate) {
            onClose();
            onNavigate(target);
        }
    };

    if (!isOpen) return null;

    const ActiveComponent = activeModule.component;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="glass-card bg-surface-card rounded-[2rem] shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col md:flex-row border border-border-subtle" onClick={e => e.stopPropagation()}>
                
                {/* SIDEBAR NAVIGATION */}
                <div className="w-full md:w-80 bg-surface-sidebar border-l border-border-subtle flex flex-col shrink-0">
                    <div className="p-6 border-b border-border-subtle bg-surface-overlay">
                        <h2 className="font-black text-xl text-txt-main flex items-center gap-2">
                            <BookOpen className="text-blue-500" />
                            الأكاديمية التعليمية
                        </h2>
                        <div className="mt-3 h-1.5 w-full bg-surface-input rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_#10b981]" 
                                style={{ width: `${(completedModules.size / GUIDE_MODULES.length) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-txt-muted mt-2 font-bold flex justify-between">
                            <span>مسار الاحتراف</span>
                            <span>{Math.round((completedModules.size / GUIDE_MODULES.length) * 100)}%</span>
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {GUIDE_MODULES.map((module, idx) => {
                            const isCompleted = completedModules.has(module.id);
                            const isActive = activeModuleId === module.id;
                            const modTheme = getTheme(module.color);
                            
                            return (
                                <button
                                    key={module.id}
                                    onClick={() => setActiveModuleId(module.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right group relative overflow-hidden ${
                                        isActive 
                                        ? `bg-surface-card shadow-md ring-1 ring-border-highlight ${modTheme.text}` 
                                        : 'hover:bg-surface-overlay hover:shadow-sm text-txt-secondary'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors z-10 ${
                                        isCompleted && !isActive ? 'bg-emerald-500/10 text-emerald-400' : 
                                        isActive ? modTheme.bg + ' text-white' : 'bg-surface-input group-hover:bg-surface-overlay'
                                    }`}>
                                        {isCompleted && !isActive ? <CheckCircle2 size={16}/> : <span className="text-xs font-black">{idx + 1}</span>}
                                    </div>
                                    <div className="flex-1 z-10 min-w-0">
                                        <span className="text-xs font-bold block truncate">{module.title}</span>
                                    </div>
                                    {isActive && <div className={`absolute right-0 top-0 bottom-0 w-1 ${modTheme.bg}`}></div>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="p-4 border-t border-border-subtle bg-surface-overlay">
                        <Button onClick={onClose} variant="secondary" className="w-full">خروج مؤقت</Button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col overflow-hidden relative bg-surface-app">
                    {/* Hero Header */}
                    <div className={`h-40 ${theme.bg} relative flex items-center justify-center overflow-hidden shrink-0 transition-colors duration-700 shadow-lg`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                        <activeModule.icon size={120} className="text-white/10 absolute top-1/2 left-10 -translate-y-1/2 rotate-12 transition-all duration-700" />
                        
                        <div className="relative z-10 text-center text-white px-4 animate-fade-in-down w-full max-w-2xl">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                                    <activeModule.icon size={24} className="text-white" />
                                </div>
                                <span className="text-white/90 text-xs font-black uppercase tracking-widest bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    الدرس {activeIndex + 1} من {GUIDE_MODULES.length}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black mb-2 drop-shadow-md">{activeModule.title}</h1>
                        </div>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-surface-app">
                        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up key={activeModule.id}">
                            
                            {/* Summary Card */}
                            <section className="text-center bg-surface-card p-6 rounded-3xl border border-border-subtle relative overflow-hidden shadow-sm">
                                <div className={`absolute top-0 right-0 w-1.5 h-full ${theme.bg}`}></div>
                                <h3 className="text-xs font-black text-txt-muted uppercase tracking-widest mb-3">الفكرة باختصار</h3>
                                <p className="text-lg font-medium text-txt-main leading-relaxed">
                                    {activeModule.summary}
                                </p>
                            </section>

                            {/* Detailed Content */}
                            <div className="space-y-6">
                                <div className="bg-transparent">
                                    <h4 className={`text-lg font-black ${theme.text} mb-6 flex items-center gap-2 border-b border-border-subtle pb-4`}>
                                        <BookOpen size={20}/>
                                        الشرح التفصيلي
                                    </h4>
                                    
                                    {/* Render the specific module component */}
                                    <ActiveComponent onAction={handleNavigateAction} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 border-t border-border-subtle flex justify-between items-center bg-surface-overlay text-xs font-bold text-txt-muted shadow-[0_-5px_20px_rgba(0,0,0,0.2)] z-20 backdrop-blur-md">
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    const currIdx = GUIDE_MODULES.findIndex(m => m.id === activeModuleId);
                                    if (currIdx > 0) setActiveModuleId(GUIDE_MODULES[currIdx - 1].id);
                                }}
                                disabled={activeIndex === 0}
                                className="px-5 py-2.5 rounded-xl hover:bg-surface-input disabled:opacity-30 transition-colors text-txt-secondary font-bold"
                            >
                                السابق
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleNext}
                                className={`px-8 py-2.5 rounded-xl text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 ${theme.bg} hover:brightness-110`}
                            >
                                {activeIndex === GUIDE_MODULES.length - 1 ? 'إنهاء واستلام الوسام' : 'التالي'}
                                {activeIndex < GUIDE_MODULES.length - 1 && <ArrowRight size={16} className="rtl:rotate-180" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
