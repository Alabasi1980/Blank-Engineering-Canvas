
import React, { useState, useEffect } from 'react';
import { Palette, Type, Check, Sparkles, Layout, Monitor, Shuffle, MousePointer2, Grid, Droplets, Move, Copy, Volume2, VolumeX, Beaker } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ThemeConfig } from '../../types';
import { Button } from '../../shared/components/Button';
import { SettingsSectionHeader } from './components/system/SettingsSectionHeader';
import { useUI } from '../../context/UIContext';
import { AudioEngine } from '../../core/services/AudioEngine';
import { ColorFactory } from '../../core/theme/ColorFactory';

const FONTS = [
    { name: 'Cairo', label: 'Cairo', desc: 'الخط الرسمي المعياري' },
    { name: 'IBM Plex Sans Arabic', label: 'IBM Plex', desc: 'تقني وعصري' },
    { name: 'Tajawal', label: 'Tajawal', desc: 'ناعم ومقروء' },
];

const PRESETS = [
    { name: 'سديم النيون (Nebula)', bg: '#0f0518', primary: '#6366f1', secondary: '#d946ef', surface: 'rgba(30, 20, 50, 0.65)' },
    { name: 'منتصف الليل (Midnight)', bg: '#020617', primary: '#3b82f6', secondary: '#10b981', surface: 'rgba(15, 23, 42, 0.8)' },
    { name: 'العمق الأسود (Abyss)', bg: '#000000', primary: '#f59e0b', secondary: '#ef4444', surface: 'rgba(20, 20, 20, 0.9)' },
    { name: 'أفق المحيط (Ocean)', bg: '#0c4a6e', primary: '#38bdf8', secondary: '#7dd3fc', surface: 'rgba(12, 74, 110, 0.7)' },
    { name: 'الغابة الرقمية (Forest)', bg: '#022c22', primary: '#10b981', secondary: '#a3e635', surface: 'rgba(6, 78, 59, 0.7)' },
    { name: 'الياقوت (Ruby)', bg: '#450a0a', primary: '#f43f5e', secondary: '#fb7185', surface: 'rgba(80, 7, 36, 0.7)' },
];

const DEFAULT_THEME: ThemeConfig = {
    mode: 'dark',
    primaryColor: '#6366f1',
    secondaryColor: '#d946ef',
    backgroundColor: '#0f0518',
    surfaceColor: 'rgba(30, 20, 50, 0.65)',
    fontFamily: 'Cairo',
    radius: 'lg',
    texture: 'none',
    blur: 20,
    soundEnabled: false
};

const ColorInput = ({ label, desc, value, onChange }: { label: string, desc: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <span className="text-[10px] text-txt-secondary block mb-1">{label}</span>
        <div className="flex gap-2">
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-border-subtle p-0 shadow-sm" />
            <div className="flex-1 flex flex-col justify-center">
                <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-surface-input text-[10px] border border-border-subtle rounded p-1.5 font-mono uppercase text-txt-main outline-none focus:border-primary-500" />
                <span className="text-[9px] text-txt-muted mt-0.5">{desc}</span>
            </div>
        </div>
    </div>
);

export const ThemeSettingsView: React.FC = () => {
    const { config, updateConfig, saveDraftNow } = useCompany();
    const { showToast } = useUI();
    const [isSaving, setIsSaving] = useState(false);
    
    // Initialize state
    const [tempTheme, setTempTheme] = useState<ThemeConfig>(() => {
        const current = config?.branding?.theme;
        return {
            mode: current?.mode || DEFAULT_THEME.mode,
            primaryColor: current?.primaryColor || DEFAULT_THEME.primaryColor,
            secondaryColor: current?.secondaryColor || DEFAULT_THEME.secondaryColor,
            backgroundColor: current?.backgroundColor || DEFAULT_THEME.backgroundColor,
            surfaceColor: current?.surfaceColor || DEFAULT_THEME.surfaceColor,
            fontFamily: current?.fontFamily || DEFAULT_THEME.fontFamily,
            radius: current?.radius || DEFAULT_THEME.radius,
            texture: current?.texture || DEFAULT_THEME.texture,
            blur: current?.blur || DEFAULT_THEME.blur,
            soundEnabled: current?.soundEnabled ?? DEFAULT_THEME.soundEnabled
        };
    });

    const [colorScale, setColorScale] = useState<Record<string, string>>({});

    // Apply variables to DOM immediately on change to reflect in the UI (Instant Feedback)
    useEffect(() => {
        const palette = ColorFactory.generate(tempTheme.primaryColor, tempTheme.mode);
        setColorScale(palette.primary.scale); // Save for visualization

        const root = document.documentElement;
        const t = tempTheme;
        
        // Use factory output for consistent physics-based colors
        root.style.setProperty('--bg-app', palette.bg.app);
        root.style.setProperty('--color-primary', palette.primary.base);
        root.style.setProperty('--color-primary-hover', palette.primary.hover);
        root.style.setProperty('--color-primary-glass', palette.primary.glass);
        root.style.setProperty('--color-primary-glow', palette.primary.glow);
        root.style.setProperty('--color-secondary', t.secondaryColor);
        root.style.setProperty('--glass-surface', palette.bg.panel);
        
        root.style.setProperty('--app-font', t.fontFamily);
        root.style.setProperty('--radius-button', t.radius === 'full' ? '9999px' : t.radius === 'lg' ? '12px' : t.radius === 'md' ? '8px' : '0px');
        
        // Texture & Blur
        root.style.setProperty('--glass-blur', `${t.blur}px`);
        let textureUrl = 'none';
        let textureSize = 'auto';
        if (t.texture === 'grid') {
            textureUrl = `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`;
            textureSize = '40px 40px';
        } else if (t.texture === 'dots') {
            textureUrl = `radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`;
            textureSize = '20px 20px';
        } else if (t.texture === 'noise') {
            textureUrl = `url("https://www.transparenttextures.com/patterns/stardust.png")`;
        }
        root.style.setProperty('--bg-texture-image', textureUrl);
        root.style.setProperty('--bg-texture-size', textureSize);

        // Atmosphere
        root.style.setProperty('--bg-atmosphere', `radial-gradient(circle at 50% -20%, ${palette.primary.glass} 0%, ${palette.bg.app} 70%)`);

    }, [tempTheme]);

    const handleApply = (updates: Partial<ThemeConfig>) => {
        const newTheme = { ...tempTheme, ...updates };
        setTempTheme(newTheme);
        // Important: Update config context so it persists on save
        updateConfig({ branding: { ...config.branding, theme: newTheme } });
        
        if (updates.soundEnabled !== undefined) {
            AudioEngine.play(updates.soundEnabled ? 'success' : 'toggle');
        } else if (newTheme.soundEnabled) {
            AudioEngine.play('click');
        }
    };

    const handleRandomize = () => {
        const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        handleApply({
            primaryColor: randomColor(),
            secondaryColor: randomColor(),
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveDraftNow();
            showToast('تم حفظ الثيم بنجاح', 'success');
            if (tempTheme.soundEnabled) AudioEngine.play('success');
        } finally {
            setIsSaving(false);
        }
    };

    const copyThemeJson = () => {
        navigator.clipboard.writeText(JSON.stringify(tempTheme, null, 2));
        showToast('تم نسخ كود الثيم', 'success');
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden relative text-txt-main transition-colors duration-500" style={{ backgroundColor: 'var(--bg-app)' }}>
            
            {/* Header */}
            <div className="shrink-0 p-6 border-b border-border-subtle z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-overlay backdrop-blur-md">
                <SettingsSectionHeader 
                    title="استوديو التصميم (Theme Studio)"
                    description="مصنع الألوان الذكي. نستخدم معادلات فيزيائية لتوليد تدرجات لونية متجانسة."
                    icon={Palette}
                    bgClass="bg-surface-input"
                    iconColorClass="text-txt-main"
                />
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="secondary" onClick={handleRandomize} icon={<Shuffle size={16}/>}>توليد عشوائي</Button>
                    <Button 
                        onClick={handleSave} 
                        loading={isSaving} 
                        size="lg" 
                        icon={<Check size={18}/>} 
                        variant="primary"
                        className="shadow-lg shadow-primary-500/20 font-black"
                    >
                        حفظ التصميم
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                
                {/* LEFT: Controls Panel */}
                <div className="w-full lg:w-[400px] border-l border-border-subtle overflow-y-auto custom-scrollbar p-6 space-y-8 z-10 backdrop-blur-xl glass-sidebar">
                    
                    {/* Scale Visualization (The Factory Output) */}
                    <section>
                        <h4 className="label-fantasy flex items-center gap-2 mb-3">
                            <Beaker size={14}/> خط إنتاج الألوان (Scale Generation)
                        </h4>
                        <div className="flex rounded-xl overflow-hidden h-12 shadow-lg ring-1 ring-border-subtle">
                            {Object.entries(colorScale).map(([step, hex]) => (
                                <div 
                                    key={step} 
                                    className="flex-1 group relative cursor-help" 
                                    style={{ backgroundColor: hex }}
                                    title={`Step ${step}: ${hex}`}
                                >
                                    <span className="absolute bottom-0 inset-x-0 text-[8px] text-center opacity-0 group-hover:opacity-100 bg-black/50 text-white font-mono">
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-txt-muted mt-2 leading-relaxed">
                            يتم توليد هذا التدرج (50-950) تلقائياً باستخدام معادلات Hue Rotation للحصول على ظلال طبيعية بدلاً من الخلط الخطي.
                        </p>
                    </section>

                    <div className="h-px bg-border-subtle"></div>

                    {/* 1. Presets */}
                    <section>
                        <h4 className="label-fantasy flex items-center gap-2">
                            <Sparkles size={14}/> قوالب لونية جاهزة
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {PRESETS.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleApply({ 
                                        backgroundColor: preset.bg, 
                                        primaryColor: preset.primary, 
                                        secondaryColor: preset.secondary,
                                        surfaceColor: preset.surface 
                                    })}
                                    className={`group relative h-14 rounded-xl border transition-all overflow-hidden ${tempTheme.backgroundColor === preset.bg ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-border-subtle hover:border-primary-500/50'}`}
                                    style={{ background: preset.bg }}
                                >
                                    <div className="absolute bottom-1.5 right-2 text-[10px] font-bold text-white z-10 shadow-black drop-shadow-md">{preset.name}</div>
                                    <div className="absolute top-1.5 left-2 flex gap-1">
                                        <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/20" style={{ background: preset.primary }}></div>
                                        <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/20" style={{ background: preset.secondary }}></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="h-px bg-border-subtle"></div>

                    {/* 2. Atmosphere & Texture */}
                    <section>
                        <h4 className="label-fantasy flex items-center gap-2">
                            <Grid size={14}/> الغلاف الجوي (Atmosphere)
                        </h4>
                        <div className="flex bg-surface-input p-1 rounded-xl gap-1 border border-border-subtle mb-4">
                            {[
                                { id: 'none', label: 'صافي', icon: Check },
                                { id: 'grid', label: 'شبكة', icon: Grid },
                                { id: 'dots', label: 'نقاط', icon: Move },
                                { id: 'noise', label: 'ضجيج', icon: Droplets },
                            ].map((tex: any) => (
                                <button 
                                    key={tex.id}
                                    onClick={() => handleApply({ texture: tex.id })}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all flex flex-col items-center gap-1 ${tempTheme.texture === tex.id ? 'bg-primary-600 text-white shadow-neon' : 'text-txt-secondary hover:text-txt-main'}`}
                                >
                                    <tex.icon size={12} />
                                    {tex.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-txt-secondary">
                                    <span>ضبابية الزجاج (Blur)</span>
                                    <span>{tempTheme.blur}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="50" 
                                    value={tempTheme.blur} 
                                    onChange={e => handleApply({ blur: Number(e.target.value) })}
                                    className="w-full h-1.5 bg-surface-input rounded-lg appearance-none cursor-pointer accent-primary-500" 
                                />
                            </div>

                            <button 
                                onClick={() => handleApply({ soundEnabled: !tempTheme.soundEnabled })}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${tempTheme.soundEnabled ? 'bg-primary-500/10 border-primary-500/50 text-primary-400' : 'bg-transparent border-border-subtle text-txt-muted'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {tempTheme.soundEnabled ? <Volume2 size={18} className="text-primary-400"/> : <VolumeX size={18}/>}
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-bold">المؤثرات الصوتية</span>
                                        <span className="text-[9px] opacity-60">أصوات تقنية عند التفاعل</span>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${tempTheme.soundEnabled ? 'bg-primary-600' : 'bg-surface-input'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${tempTheme.soundEnabled ? 'right-1' : 'right-6'}`}></div>
                                </div>
                            </button>
                        </div>
                    </section>

                    <div className="h-px bg-border-subtle"></div>

                    {/* 3. Custom Colors */}
                    <section>
                        <h4 className="label-fantasy flex items-center gap-2">
                            <Palette size={14}/> التخصيص الدقيق
                        </h4>
                        <div className="space-y-4">
                            <ColorInput 
                                label="اللون الأساسي (Primary)" 
                                desc="الأزرار، الروابط، التمييز"
                                value={tempTheme.primaryColor} 
                                onChange={c => handleApply({ primaryColor: c })} 
                            />
                            <ColorInput 
                                label="اللون الثانوي (Secondary)" 
                                desc="التدرجات، العناصر الثانوية"
                                value={tempTheme.secondaryColor} 
                                onChange={c => handleApply({ secondaryColor: c })} 
                            />
                            <ColorInput 
                                label="لون الخلفية (Void)" 
                                desc="لون الفضاء العميق"
                                value={tempTheme.backgroundColor} 
                                onChange={c => handleApply({ backgroundColor: c })} 
                            />
                        </div>
                    </section>

                    <div className="h-px bg-border-subtle"></div>

                    {/* 4. Typography & UI */}
                    <section>
                        <h4 className="label-fantasy flex items-center gap-2">
                            <Type size={14}/> الخطوط والطباعة
                        </h4>
                        <div className="space-y-2 mb-6">
                            {FONTS.map(font => (
                                <button
                                    key={font.name}
                                    onClick={() => handleApply({ fontFamily: font.name })}
                                    className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between group ${tempTheme.fontFamily === font.name ? 'bg-primary-500/10 border-primary-500/50' : 'bg-transparent border-border-subtle hover:bg-surface-input'}`}
                                >
                                    <span className="text-xs font-bold text-txt-main" style={{ fontFamily: font.name }}>{font.label}</span>
                                    <span className="text-[10px] text-txt-muted" style={{ fontFamily: font.name }}>تجربة النص</span>
                                </button>
                            ))}
                        </div>

                        <h4 className="label-fantasy flex items-center gap-2">
                            <Layout size={14}/> استدارة الزوايا
                        </h4>
                        <div className="flex bg-surface-input p-1 rounded-xl gap-1 border border-border-subtle">
                            {['none', 'md', 'lg', 'full'].map((r: any) => (
                                <button 
                                    key={r}
                                    onClick={() => handleApply({ radius: r })}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${tempTheme.radius === r ? 'bg-primary-600 text-white shadow-neon' : 'text-txt-secondary hover:text-txt-main'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="pt-6 mt-6 border-t border-border-subtle">
                        <button onClick={copyThemeJson} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border-subtle rounded-xl text-xs font-bold text-txt-muted hover:text-txt-main hover:border-primary-500/30 transition-all">
                            <Copy size={14} /> نسخ كود الثيم (JSON)
                        </button>
                    </div>

                </div>

                {/* RIGHT: Live Preview HUD */}
                <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8">
                    
                    <div className="absolute top-4 left-4 z-10 bg-surface-overlay backdrop-blur-md px-4 py-2 rounded-full border border-border-subtle flex items-center gap-2 animate-pulse-glow">
                        <Monitor size={14} className="text-primary-400"/>
                        <span className="text-[10px] font-bold text-txt-main">نظام محاكاة الواجهة (Live HUD)</span>
                    </div>

                    {/* The Dashboard Mockup */}
                    <div className="w-full max-w-5xl aspect-video glass-panel rounded-3xl overflow-hidden relative flex flex-col shadow-2xl transition-all duration-500 transform hover:scale-[1.01]"
                         style={{ fontFamily: tempTheme.fontFamily }}
                    >
                        {/* Mock Navbar */}
                        <div className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-surface-overlay">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                                     style={{ background: `linear-gradient(135deg, ${tempTheme.primaryColor}, ${tempTheme.secondaryColor})` }}
                                >
                                    EIS
                                </div>
                                <div className="flex flex-col">
                                    <div className="h-2 w-24 bg-surface-input rounded-full mb-1"></div>
                                    <div className="h-1.5 w-16 bg-surface-input rounded-full opacity-60"></div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-2.5 rounded-lg text-[10px] font-bold text-white transition-all shadow-lg"
                                    style={{ backgroundColor: tempTheme.primaryColor, borderRadius: 'var(--radius-button)' }}
                                >
                                    إجراء جديد
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Mock Sidebar */}
                            <div className="w-64 border-l border-border-subtle bg-surface-sidebar p-6 space-y-4 hidden md:block">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-12 rounded-xl flex items-center px-4"
                                         style={{ 
                                             background: i===1 ? `linear-gradient(90deg, rgba(255,255,255,0.05), transparent)` : 'transparent',
                                             borderRight: i===1 ? `3px solid ${tempTheme.primaryColor}` : '3px solid transparent'
                                         }}
                                    >
                                        <div className="w-5 h-5 rounded bg-surface-input" style={{ backgroundColor: i===1 ? tempTheme.primaryColor : undefined }}></div>
                                        <div className="mr-3 h-2 w-20 bg-surface-input rounded-full"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Mock Content */}
                            <div className="flex-1 p-8 space-y-6 bg-surface-app">
                                <div className="flex gap-4">
                                    <div className="flex-1 h-32 rounded-2xl border border-border-subtle relative overflow-hidden"
                                         style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-panel)' }}
                                    >
                                        <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: tempTheme.primaryColor }}></div>
                                        <div className="p-6">
                                            <div className="h-2 w-20 bg-surface-input rounded-full mb-4"></div>
                                            <div className="h-8 w-32 bg-surface-input rounded-lg mb-2"></div>
                                            <div className="h-2 w-16 bg-surface-input rounded-full" style={{ color: tempTheme.secondaryColor }}></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 h-32 rounded-2xl border border-border-subtle bg-surface-card relative overflow-hidden hidden lg:block"
                                         style={{ borderRadius: 'var(--radius-panel)' }}
                                    >
                                        <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: tempTheme.secondaryColor }}></div>
                                        <div className="p-6">
                                            <div className="h-2 w-20 bg-surface-input rounded-full mb-4"></div>
                                            <div className="h-8 w-32 bg-surface-input rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-48 rounded-2xl border border-border-subtle bg-surface-card p-6" style={{ borderRadius: 'var(--radius-panel)' }}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="h-3 w-32 bg-surface-input rounded-full"></div>
                                        <div className="h-8 w-8 rounded-lg bg-surface-input"></div>
                                    </div>
                                    <div className="space-y-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="h-10 rounded-lg bg-surface-input flex items-center px-4 border border-border-subtle">
                                                <div className="w-6 h-6 rounded bg-surface-card"></div>
                                                <div className="mr-4 h-2 w-48 bg-surface-card rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-8 flex gap-2 text-[10px] text-txt-muted pointer-events-none">
                        <MousePointer2 size={12}/>
                        <span>تفاعل مع عناصر التحكم في القائمة اليمنى لرؤية التغييرات</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
