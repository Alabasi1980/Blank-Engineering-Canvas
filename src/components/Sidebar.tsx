
import React, { useState } from 'react';
import { LayoutDashboard, Settings, Plus, ShoppingCart, Package, BarChart, Trash2, X, Users, Briefcase, ChevronLeft, ChevronRight, PieChart, Sliders, Menu, Hexagon, Palette } from 'lucide-react';
import { DashboardLayout, BrandingConfig } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'settings' | 'system_settings' | 'theme_settings' | any;
  onNavigate: (view: any) => void;
  dashboards: DashboardLayout[];
  activeDashboardId: string;
  onDashboardSelect: (id: string) => void;
  onAddDashboard: (title: string, icon: string) => void;
  onDeleteDashboard: (id: string) => void;
  companyConfig: BrandingConfig;
}

const ICONS = [
    { id: 'bar-chart', icon: <BarChart size={20} /> },
    { id: 'shopping-cart', icon: <ShoppingCart size={20} /> },
    { id: 'package', icon: <Package size={20} /> },
    { id: 'users', icon: <Users size={20} /> },
    { id: 'briefcase', icon: <Briefcase size={20} /> },
    { id: 'pie-chart', icon: <PieChart size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate, 
  dashboards, 
  activeDashboardId, 
  onDashboardSelect,
  onAddDashboard,
  onDeleteDashboard,
  companyConfig
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  const getIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'shopping-cart': return <ShoppingCart size={size} />;
      case 'package': return <Package size={size} />;
      case 'users': return <Users size={size} />;
      case 'briefcase': return <Briefcase size={size} />;
      case 'pie-chart': return <PieChart size={size} />;
      default: return <BarChart size={size} />;
    }
  };

  const handleCreate = () => {
      if (!newTitle.trim()) return;
      onAddDashboard(newTitle, 'bar-chart');
      setIsCreating(false);
      setNewTitle('');
  };

  const NavItem = ({ active, onClick, icon, label, collapsed }: any) => (
    <button
        onClick={() => { onClick(); setIsMobileOpen(false); }}
        className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 mb-1 overflow-hidden ${
        active 
            ? 'text-primary-500 shadow-glass border border-primary-500/30 bg-primary-500/10' 
            : 'text-txt-secondary hover:text-txt-main hover:bg-surface-card border border-transparent'
        } ${collapsed ? 'justify-center' : ''}`}
    >
        {active && (
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full shadow-[0_0_15px_currentColor] bg-primary-500"></div>
        )}
        <span 
            className={`shrink-0 relative z-10 transition-transform group-hover:scale-110 duration-300 ${active ? 'text-primary-400 drop-shadow-[0_0_5px_rgba(var(--color-primary-rgb),0.5)]' : ''}`}
        >
            {icon}
        </span>
        {!collapsed && (
            <span className="font-bold tracking-wide truncate text-xs relative z-10">{label}</span>
        )}
    </button>
  );

  return (
    <>
      <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden fixed top-4 right-4 z-50 p-2 glass-panel text-txt-main rounded-lg">
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isMobileOpen && <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileOpen(false)}></div>}

      <aside 
          className={`
            fixed md:static inset-y-0 right-0 z-50
            ${isCollapsed ? 'w-20' : 'w-64'} 
            ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            flex-shrink-0 h-screen transition-all duration-500 ease-out
            flex flex-col bg-surface-sidebar border-l border-border-subtle glass-sidebar
          `}
      >
        {/* Toggle Button */}
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden md:flex absolute -left-3 top-12 p-1 rounded-full border shadow-lg z-50 transition-colors bg-surface-card border-border-subtle text-txt-secondary hover:text-txt-main"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Branding Area */}
        <div className={`p-6 flex flex-col items-center gap-4 transition-all ${isCollapsed ? 'mb-4' : 'mb-2'}`}>
          <div className="w-12 h-12 relative group cursor-pointer animate-float">
              <div className="absolute inset-0 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity bg-primary-500"></div>
              <div className="relative w-full h-full bg-surface-card rounded-xl border border-border-highlight flex items-center justify-center text-txt-main shadow-xl backdrop-blur-md">
                  {companyConfig.logo ? <img src={companyConfig.logo} alt="Logo" className="w-8 h-8 object-contain" /> : <Hexagon size={24} className="text-primary-500" />}
              </div>
          </div>
          
          {!isCollapsed && (
              <div className="text-center animate-fade-in">
                  <h1 className="text-sm font-black tracking-tight leading-tight mb-1 text-txt-main">
                      {companyConfig.companyName}
                  </h1>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border text-txt-muted border-border-subtle bg-surface-card">
                      EIS v3.0
                  </span>
              </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-3 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          <div>
              {!isCollapsed && <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70 text-txt-muted">المساحة الرئيسية</h3>}
              <NavItem active={currentView === 'dashboard'} onClick={() => onNavigate('dashboard')} icon={<LayoutDashboard size={18} />} label="لوحة القيادة" collapsed={isCollapsed}/>
              <NavItem active={currentView === 'settings'} onClick={() => onNavigate('settings')} icon={<Settings size={18} />} label="إدارة البطاقات" collapsed={isCollapsed}/>
              <NavItem active={currentView === 'system_settings'} onClick={() => onNavigate('system_settings')} icon={<Sliders size={18} />} label="تكوين النظام" collapsed={isCollapsed}/>
              <NavItem active={currentView === 'theme_settings'} onClick={() => onNavigate('theme_settings')} icon={<Palette size={18} />} label="استوديو التصميم" collapsed={isCollapsed}/>
          </div>

          <div>
              <div className={`flex justify-between items-center mb-2 px-3 ${isCollapsed ? 'flex-col gap-2' : ''}`}>
                  {!isCollapsed && <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 text-txt-muted">اللوحات الخاصة</h3>}
                  {!isCreating && !isCollapsed && (
                      <button onClick={() => setIsCreating(true)} className="hover:text-txt-main transition-colors text-txt-secondary" title="إضافة لوحة">
                          <Plus size={14} />
                      </button>
                  )}
              </div>
              
              <div className="space-y-1">
                  {dashboards.map(dash => (
                      <div key={dash.id} className="group relative">
                          <NavItem active={activeDashboardId === dash.id} onClick={() => onDashboardSelect(dash.id)} icon={getIcon(dash.icon, 18)} label={dash.title} collapsed={isCollapsed}/>
                          {!isCollapsed && dashboards.length > 1 && (
                              <button onClick={(e) => { e.stopPropagation(); onDeleteDashboard(dash.id); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-txt-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 size={12} />
                              </button>
                          )}
                      </div>
                  ))}
                  
                  {isCreating && !isCollapsed && (
                      <div className="border rounded-xl p-2 mt-2 animate-fade-in backdrop-blur-md border-border-subtle bg-surface-input">
                          <input 
                              type="text" 
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="اسم اللوحة..."
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                              className="w-full border rounded-lg px-2 py-1.5 text-xs placeholder-txt-muted mb-2 outline-none bg-surface-app border-border-subtle text-txt-main"
                          />
                          <div className="flex gap-2">
                              <button onClick={handleCreate} className="flex-1 text-[10px] py-1 rounded font-bold transition-colors bg-primary-600 text-white hover:bg-primary-500">حفظ</button>
                              <button onClick={() => setIsCreating(false)} className="flex-1 text-[10px] py-1 rounded font-bold transition-colors bg-surface-card text-txt-secondary hover:bg-surface-overlay">إلغاء</button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t backdrop-blur-md border-border-subtle bg-surface-overlay">
          <div className={`flex items-center gap-3 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ring-2 ring-border-highlight bg-gradient-to-br from-primary-500 to-secondary text-white">
              {companyConfig.systemUser.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-txt-main">{companyConfig.systemUser}</p>
                <p className="text-[10px] truncate font-mono opacity-80 text-txt-secondary">{companyConfig.userEmail}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
