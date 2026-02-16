
import React from 'react';
import { ChevronRight, GraduationCap } from 'lucide-react';

interface SettingHelpBlockProps {
  title: string;
  description: string;
  onClick: () => void;
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'indigo' | 'slate';
}

export const SettingHelpBlock: React.FC<SettingHelpBlockProps> = ({ 
  title, 
  description, 
  onClick,
  color = 'indigo'
}) => {
  const themes = {
    blue: 'from-slate-800 to-slate-900 text-blue-300',
    purple: 'from-slate-800 to-slate-900 text-purple-300',
    emerald: 'from-slate-800 to-slate-900 text-emerald-300',
    amber: 'from-slate-800 to-slate-900 text-amber-300',
    indigo: 'from-slate-800 to-slate-900 text-indigo-300',
    slate: 'from-slate-800 to-slate-900 text-slate-300',
  };

  return (
    <div 
        onClick={onClick}
        className={`bg-gradient-to-br ${themes[color]} p-6 rounded-3xl text-white relative overflow-hidden shadow-lg flex gap-5 items-center mt-8 cursor-pointer hover:scale-[1.01] transition-all group shrink-0 select-none`}
    >
        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shrink-0 group-hover:bg-white/20 transition-colors">
            <GraduationCap size={24} className="text-white/90" />
        </div>
        <div className="relative z-10 flex-1">
            <h4 className="font-bold text-sm mb-1 group-hover:text-white transition-colors">{title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed opacity-90 max-w-2xl">
                {description}
            </p>
        </div>
        <div className="p-2 bg-white/5 rounded-full">
            <ChevronRight className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
        {/* Decorative background blurs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
    </div>
  );
};
