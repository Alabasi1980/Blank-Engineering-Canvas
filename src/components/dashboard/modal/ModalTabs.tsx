
import React from 'react';
import { LayoutDashboard, BarChart3, List } from 'lucide-react';

interface ModalTabsProps {
    activeTab: 'pivot' | 'charts' | 'details';
    onTabChange: (tab: 'pivot' | 'charts' | 'details') => void;
}

export const ModalTabs: React.FC<ModalTabsProps> = ({ activeTab, onTabChange }) => (
    <div className="px-6 border-b border-border-subtle bg-surface-overlay/50 flex gap-1 shrink-0 backdrop-blur-md">
        {[
            { id: 'pivot', label: 'التحليل التجميعي', icon: LayoutDashboard },
            { id: 'charts', label: 'تحليل رسومي', icon: BarChart3 },
            { id: 'details', label: 'قائمة التفاصيل', icon: List }
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                className={`py-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 rounded-t-lg ${
                    activeTab === tab.id 
                    ? 'border-primary-500 text-primary-400 bg-surface-app/50' 
                    : 'border-transparent text-txt-muted hover:text-txt-secondary hover:bg-surface-input'
                }`}
            >
                <tab.icon size={16} />
                {tab.label}
            </button>
        ))}
    </div>
);
