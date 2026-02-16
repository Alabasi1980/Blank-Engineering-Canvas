
import React from 'react';
import { 
    LayoutGrid, ListTree, List, CheckCircle2, Box
} from 'lucide-react';
import { MasterEntityDefinition } from '../../../../types';
import { CARD_COLORS, MASTER_ICONS } from '../../../../constants';

interface MasterDataSidebarProps {
    entities: MasterEntityDefinition[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const MasterDataSidebar: React.FC<MasterDataSidebarProps> = ({ entities, selectedId, onSelect }) => (
    <aside className="w-72 border-l border-border-subtle bg-surface-sidebar flex flex-col shrink-0">
        <div className="p-6 border-b border-border-subtle bg-surface-overlay/80 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2 bg-surface-card text-txt-main rounded-lg shadow-sm border border-border-subtle">
                <LayoutGrid size={18} />
            </div>
            <div>
                <h3 className="text-xs font-black text-txt-main uppercase tracking-tight">إدارة البيانات</h3>
                <p className="text-[10px] text-txt-muted">القوائم المرجعية</p>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {entities.map(entity => {
                const Icon = MASTER_ICONS[entity.icon || 'Box'] || Box;
                const colorTheme = CARD_COLORS.find(c => c.value === entity.color) || CARD_COLORS[0];
                const isSelected = selectedId === entity.id;

                return (
                    <button
                        key={entity.id}
                        onClick={() => onSelect(entity.id)}
                        className={`group w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 border ${
                            isSelected 
                            ? 'bg-surface-card border-primary-500/30 shadow-md ring-1 ring-primary-500/10 relative z-10' 
                            : 'bg-transparent border-transparent hover:bg-surface-overlay hover:border-border-subtle hover:shadow-sm'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? `${colorTheme.text} ${colorTheme.bg.replace('600', '500/20')}` : 'bg-surface-input text-txt-muted group-hover:bg-surface-card group-hover:shadow-inner'}`}>
                                <Icon size={16} strokeWidth={isSelected ? 2.5 : 2} />
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                                <span className={`text-xs font-bold truncate transition-colors ${isSelected ? 'text-txt-main' : 'text-txt-secondary group-hover:text-txt-main'}`}>
                                    {entity.label}
                                </span>
                                <span className="text-[9px] text-txt-muted flex items-center gap-1">
                                    {entity.isTree ? <ListTree size={8}/> : <List size={8}/>}
                                    {entity.isTree ? 'شجرة' : 'قائمة'}
                                </span>
                            </div>
                        </div>
                        
                        {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                        )}
                    </button>
                );
            })}
        </div>

        <div className="p-4 border-t border-border-subtle bg-surface-overlay/50">
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2.5 rounded-xl border border-emerald-500/20 shadow-sm">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>قاعدة البيانات المحلية متصلة</span>
            </div>
        </div>
    </aside>
);
