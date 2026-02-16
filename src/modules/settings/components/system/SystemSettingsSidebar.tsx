
import React from 'react';
import { 
    Building2, Database, Wifi, GitBranch, 
    Table, ListTree, HardDrive, 
    ShieldCheck, Layers, Wand2, Coins, FileSpreadsheet,
    ChevronRight, Rocket
} from 'lucide-react';

export type SettingsTab = 'profile' | 'import' | 'storage' | 'integrations' | 'versions' | 'table_views' | 'list_meta' | 'list_data' | 'dimensions' | 'logic_architect' | 'integrity_center' | 'currency';

interface TabDefinition {
  id: SettingsTab;
  label: string;
  icon: any;
  group: 'foundations' | 'intelligence' | 'data_bridge' | 'governance';
}

export const SYSTEM_TABS: TabDefinition[] = [
  // 1. Foundations (The Skeleton)
  { id: 'profile', label: 'الهوية وقاموس المسميات', icon: Building2, group: 'foundations' },
  { id: 'list_meta', label: 'هيكلية القوائم (Entities)', icon: ListTree, group: 'foundations' },
  { id: 'dimensions', label: 'سجل الأبعاد (Dimensions)', icon: Layers, group: 'foundations' },

  // 2. Intelligence (The Brain)
  { id: 'logic_architect', label: 'مختبر المنطق والمعادلات', icon: Wand2, group: 'intelligence' },
  { id: 'currency', label: 'أسعار الصرف والتحويل', icon: Coins, group: 'intelligence' },
  { id: 'table_views', label: 'نماذج عرض الجداول', icon: Table, group: 'intelligence' },

  // 3. Data Bridge (The Flow)
  { id: 'import', label: 'حاويات البيانات (Transactions)', icon: FileSpreadsheet, group: 'data_bridge' },
  { id: 'list_data', label: 'إدارة مدخلات القوائم', icon: Database, group: 'data_bridge' },
  { id: 'integrations', label: 'مزامنة API الخارجية', icon: Wifi, group: 'data_bridge' },
  { id: 'storage', label: 'المستودع والمزامنة المحلية', icon: HardDrive, group: 'data_bridge' },

  // 4. Governance (The Shield)
  { id: 'versions', label: 'الإصدارات والنشر', icon: GitBranch, group: 'governance' },
  { id: 'integrity_center', label: 'رادار النزاهة والتدقيق', icon: ShieldCheck, group: 'governance' },
];

interface SidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SystemSettingsSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const groups = [
    { id: 'foundations', label: '1. مرحلة التأسيس' },
    { id: 'intelligence', label: '2. مرحلة هندسة المنطق' },
    { id: 'data_bridge', label: '3. جسر البيانات والتدفق' },
    { id: 'governance', label: '4. الحوكمة والأمان' },
  ];

  return (
    <aside className="w-72 bg-surface-sidebar backdrop-blur-xl flex flex-col shrink-0 border-l border-border-subtle shadow-2xl z-30 h-full relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none"></div>

      <div className="p-8 border-b border-border-subtle relative z-10">
         <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center text-white shadow-neon animate-pulse-slow">
                <Rocket size={20} />
            </div>
            <h1 className="text-txt-main font-black text-xl tracking-tight drop-shadow-md">EIS Architect</h1>
         </div>
         <p className="text-[10px] text-primary-300/80 uppercase tracking-widest font-bold">رحلة بناء المنظومة</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 relative z-10">
        {groups.map((group, gIdx) => (
          <div key={group.id} className="space-y-2">
            <h3 className="px-4 text-[9px] font-black text-txt-muted uppercase tracking-[0.2em] flex items-center justify-between header-glow">
                {group.label}
                <ChevronRight size={10} />
            </h3>
            <div className="space-y-1">
              {SYSTEM_TABS.filter(t => t.group === group.id).map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all relative overflow-hidden group ${
                      isActive 
                        ? 'bg-surface-card text-txt-main shadow-lg border border-border-highlight' 
                        : 'hover:bg-surface-overlay hover:text-txt-main text-txt-secondary border border-transparent'
                    }`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent opacity-50"></div>}
                    <tab.icon size={16} className={`transition-colors ${isActive ? 'text-primary-400' : 'text-txt-muted group-hover:text-txt-secondary'}`} />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            {gIdx < groups.length - 1 && <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent mt-4"></div>}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border-subtle bg-black/20 relative z-10">
         <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-border-subtle backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-black shadow-lg">A</div>
            <div>
                <p className="text-[10px] font-black text-txt-main uppercase">Architect Mode</p>
                <p className="text-[9px] text-txt-muted">v2.5 Simplified</p>
            </div>
         </div>
      </div>
    </aside>
  );
};
