
import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface SettingsSectionHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass?: string;
  bgClass?: string;
  action?: React.ReactNode;
  helpLink?: string;
}

export const SettingsSectionHeader: React.FC<SettingsSectionHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColorClass = 'text-primary-400',
  bgClass = 'bg-primary-500/10',
  action,
  helpLink
}) => (
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shrink-0 animate-fade-in gap-6 glass-card p-6 rounded-3xl border border-border-subtle backdrop-blur-sm bg-surface-card">
    <div className="flex items-center gap-5">
      <div className={`p-4 ${bgClass} ${iconColorClass} rounded-2xl shadow-sm ring-1 ring-white/10`}>
        <Icon size={32} strokeWidth={2.5} />
      </div>
      <div>
        <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-txt-main tracking-tight">{title}</h3>
            {helpLink && (
                <button title="طلب المساعدة التعليمية" className="text-txt-muted hover:text-primary-400 transition-colors">
                    <HelpCircle size={18} />
                </button>
            )}
        </div>
        <p className="text-sm text-txt-secondary font-medium max-w-2xl mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
    {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
  </div>
);
