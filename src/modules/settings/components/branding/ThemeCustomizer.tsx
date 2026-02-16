
import React from 'react';
import { Palette, Type, LayoutTemplate, Check, Grid, Move, Droplets, Shuffle, Monitor, Copy, Volume2, VolumeX, Beaker, MousePointer2 } from 'lucide-react';
import { ThemeConfig } from '../../../../types';
import { Button } from '../../../../shared/components/Button';
import { SettingsSectionHeader } from '../system/SettingsSectionHeader';
import { useUI } from '../../../../context/UIContext';
import { AudioEngine } from '../../../../core/services/AudioEngine';
import { ColorFactory } from '../../../../core/theme/ColorFactory';
import { useCompany } from '../../../../context/CompanyContext';

interface ThemeCustomizerProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
}

const PRESETS = [
    { name: 'سديم النيون (Nebula)', bg: '#0f0518', primary: '#6366f1', secondary: '#d946ef', surface: 'rgba(30, 20, 50, 0.65)' },
    { name: 'منتصف الليل (Midnight)', bg: '#020617', primary: '#3b82f6', secondary: '#10b981', surface: 'rgba(15, 23, 42, 0.8)' },
    { name: 'العمق الأسود (Abyss)', bg: '#000000', primary: '#f59e0b', secondary: '#ef4444', surface: 'rgba(20, 20, 20, 0.9)' },
    { name: 'أفق المحيط (Ocean)', bg: '#0c4a6e', primary: '#38bdf8', secondary: '#7dd3fc', surface: 'rgba(12, 74, 110, 0.7)' },
    { name: 'الغابة الرقمية (Forest)', bg: '#022c22', primary: '#10b981', secondary: '#a3e635', surface: 'rgba(6, 78, 59, 0.7)' },
    { name: 'الياقوت (Ruby)', bg: '#450a0a', primary: '#f43f5e', secondary: '#fb7185', surface: 'rgba(80, 7, 36, 0.7)' },
];

const FONTS = [
    { name: 'Cairo', label: 'Cairo', desc: 'الخط الرسمي المعياري' },
    { name: 'IBM Plex Sans Arabic', label: 'IBM Plex', desc: 'تقني وعصري' },
    { name: 'Tajawal', label: 'Tajawal', desc: 'ناعم ومقروء' },
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

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ theme, onChange }) => {
  
  const handleColorChange = (key: keyof ThemeConfig, val: string) => {
      onChange({ ...theme, [key]: val });
  };

  const handleRandomize = () => {
        const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        onChange({
            ...theme,
            primaryColor: randomColor(),
            secondaryColor: randomColor(),
        });
  };

  const copyThemeJson = () => {
        navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <h4 className="text-sm font-bold text-txt-main border-b border-border-subtle pb-2 flex items-center gap-2">
            <Palette size={16} className="text-txt-muted" />
            استوديو التصميم والسمات (Theme Studio)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Presets */}
            <div className="space-y-3">
                <label className="block text-xs font-bold text-txt-secondary">قوالب جاهزة</label>
                <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map(preset => (
                        <button 
                            key={preset.name}
                            onClick={() => onChange({ ...theme, backgroundColor: preset.bg, primaryColor: preset.primary, surfaceColor: preset.surface })}
                            className="p-3 rounded-xl border border-border-subtle flex items-center gap-3 hover:border-primary-400 transition-all group bg-surface-input hover:bg-surface-overlay"
                        >
                            <div className="w-8 h-8 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: preset.bg }}>
                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-txt-secondary group-hover:text-primary-400">{preset.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-3">
                <label className="block text-xs font-bold text-txt-secondary">تخصيص الألوان يدوياً</label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <span className="text-[10px] text-txt-muted block mb-1">اللون الأساسي (Primary)</span>
                        <div className="flex gap-2">
                            <input type="color" value={theme.primaryColor} onChange={e => handleColorChange('primaryColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                            <input type="text" value={theme.primaryColor} onChange={e => handleColorChange('primaryColor', e.target.value)} className="w-20 text-[10px] border border-border-subtle bg-surface-input text-txt-main rounded p-1 font-mono uppercase" />
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-txt-muted block mb-1">اللون الثانوي (Secondary)</span>
                        <div className="flex gap-2">
                            <input type="color" value={theme.secondaryColor} onChange={e => handleColorChange('secondaryColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                            <input type="text" value={theme.secondaryColor} onChange={e => handleColorChange('secondaryColor', e.target.value)} className="w-20 text-[10px] border border-border-subtle bg-surface-input text-txt-main rounded p-1 font-mono uppercase" />
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-txt-muted block mb-1">لون الخلفية (Void)</span>
                        <div className="flex gap-2">
                            <input type="color" value={theme.backgroundColor} onChange={e => handleColorChange('backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                            <input type="text" value={theme.backgroundColor} onChange={e => handleColorChange('backgroundColor', e.target.value)} className="w-20 text-[10px] border border-border-subtle bg-surface-input text-txt-main rounded p-1 font-mono uppercase" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Atmosphere & Texture */}
        <div className="pt-4 border-t border-border-subtle">
            <h4 className="text-xs font-bold text-txt-muted mb-3 flex items-center gap-2">
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
                        onClick={() => handleColorChange('texture', tex.id)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all flex flex-col items-center gap-1 ${theme.texture === tex.id ? 'bg-primary-600 text-white shadow-neon' : 'text-txt-secondary hover:text-txt-main'}`}
                    >
                        <tex.icon size={12} />
                        {tex.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-txt-muted">
                        <span>ضبابية الزجاج (Blur)</span>
                        <span>{theme.blur}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="50" 
                        value={theme.blur} 
                        onChange={e => onChange({ ...theme, blur: Number(e.target.value) })}
                        className="w-full h-1.5 bg-surface-input rounded-lg appearance-none cursor-pointer accent-primary-500" 
                    />
                </div>

                <button 
                    onClick={() => onChange({ ...theme, soundEnabled: !theme.soundEnabled })}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${theme.soundEnabled ? 'bg-primary-500/20 border-primary-500/50 text-white' : 'bg-transparent border-border-subtle text-txt-muted'}`}
                >
                    <div className="flex items-center gap-3">
                        {theme.soundEnabled ? <Volume2 size={18} className="text-primary-400"/> : <VolumeX size={18}/>}
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold">المؤثرات الصوتية</span>
                            <span className="text-[9px] opacity-60">أصوات تقنية عند التفاعل</span>
                        </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${theme.soundEnabled ? 'bg-primary-600' : 'bg-surface-input'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme.soundEnabled ? 'right-1' : 'right-6'}`}></div>
                    </div>
                </button>
            </div>
        </div>

        {/* Typography */}
        <div className="pt-4 border-t border-border-subtle">
            <h4 className="text-xs font-bold text-txt-muted mb-3 flex items-center gap-2">
                <Type size={14} /> الخطوط والطباعة
            </h4>
            <div className="flex flex-wrap gap-2">
                {FONTS.map(font => (
                    <button 
                        key={font.name}
                        onClick={() => onChange({ ...theme, fontFamily: font.name })}
                        className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                            theme.fontFamily === font.name 
                            ? 'bg-primary-600 text-white border-primary-600 shadow-md' 
                            : 'bg-surface-card text-txt-secondary border-border-subtle hover:bg-surface-overlay'
                        }`}
                        style={{ fontFamily: font.name }}
                    >
                        {font.label}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
