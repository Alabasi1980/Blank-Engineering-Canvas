
import React, { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ModalProvider } from './context/ModalContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { VersionProvider } from './context/VersionContext';
import { UIProvider } from './context/UIContext';
import { MasterDataStoreProvider } from './context/MasterDataStoreContext';
import { AuthProvider } from './context/AuthContext';
import { SnapshotProvider } from './context/SnapshotContext';
import { DataProvider } from './core/context/DataContext';
import { DashboardFiltersProvider } from './core/context/DashboardFiltersContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './modules/dashboard/DashboardView';
import { SettingsView } from './modules/settings/SettingsView';
import { SystemSettingsView } from './modules/settings/SystemSettingsView';
import { ThemeSettingsView } from './modules/settings/ThemeSettingsView';
import { useDashboardManagement } from './hooks/useDashboardManagement';
import { Sparkles, Layout, Database, Code, ArrowRight } from 'lucide-react';

type AppView = 'landing' | 'dashboard' | 'settings' | 'system_settings' | 'theme_settings';

const LandingPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-surface-app text-txt-main" dir="rtl">
    {/* Dynamic Background */}
    <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-500" 
        style={{ 
            background: 'radial-gradient(ellipse at top, var(--color-primary-glass) 0%, var(--surface-app) 70%, black 100%)',
            opacity: 0.8
        }}
    ></div>
    
    <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.1 }}></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}></div>

    <div className="relative z-10 max-w-4xl space-y-12 animate-fade-in">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-surface-card px-4 py-1.5 rounded-full border border-border-subtle text-txt-main text-[10px] font-black uppercase tracking-[0.3em] shadow-lg backdrop-blur-md">
        <Sparkles size={12} className="animate-spin-slow text-primary-500" /> Executive Intelligence System v3.0
      </div>
      
      {/* Hero Text */}
      <div className="space-y-6">
        <h1 className="text-7xl md:text-8xl font-black text-txt-main tracking-tighter leading-[1.1] drop-shadow-2xl">
          ابنِ حقيقتك <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary text-6xl md:text-7xl" style={{ filter: 'brightness(1.3)' }}>من الصفر إلى الرؤية</span>
        </h1>
        <p className="text-txt-secondary text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          نظام تكوين مرن يحول البيانات الخام إلى لوحات قيادة استراتيجية. <br/>
          <span className="text-primary-400 brightness-150">لا قيود. لا قوالب مسبقة. أنت المهندس.</span>
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {[
          { icon: Layout, title: "تصميم حر", desc: "واجهات تتشكل حسب احتياجك" },
          { icon: Database, title: "بيانات حية", desc: "ربط مباشر مع مصادرك" },
          { icon: Code, title: "منطق ذكي", desc: "معادلات رياضية متقدمة" },
        ].map((item, idx) => (
          <div key={idx} className="glass-card-interactive p-6 rounded-3xl group hover:border-border-highlight">
            <item.icon className="mb-4 mx-auto opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all text-txt-main" size={32} />
            <h3 className="text-txt-main font-bold text-sm mb-1">{item.title}</h3>
            <p className="text-txt-muted text-xs">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-10">
        <button 
          onClick={onEnter}
          className="btn-primary group relative px-12 py-5 text-txt-onBrand rounded-2xl font-black text-sm overflow-hidden shadow-neon"
        >
          <span className="relative flex items-center gap-3 z-10">
            دخول النظام
            <ArrowRight className="group-hover:translate-x-1 transition-transform rtl:rotate-180" size={18} />
          </span>
        </button>
      </div>
    </div>
  </div>
);

const MainAppContent: React.FC = () => {
  const { config, saveDraftNow, resetToDefault } = useCompany();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  
  const {
      activeDashboardId, setActiveDashboardId,
      activeMainCardId, setActiveMainCardId,
      activeSubCardId, setActiveSubCardId,
      handleAddDashboard, handleDeleteDashboard, handleUpdateMainCard, handleReorderMainCards,
      handleAddMainCard, handleDeleteMainCard, handleAddSubCard, handleDuplicateSubCard,
      handleDeleteSubCard, handleUpdateSubCardRules, handleUpdateSubCardInfo
  } = useDashboardManagement();

  if (currentView === 'landing') {
    return <LandingPage onEnter={() => setCurrentView('dashboard')} />;
  }

  const activeDashboard = config.dashboards.find(d => d.id === activeDashboardId);
  const mainCards = activeDashboard?.mainCards || [];
  const activeMainCard = mainCards.find(c => c.id === activeMainCardId);
  const activeSubCard = activeMainCard?.subCards.find(s => s.id === activeSubCardId);

  return (
    <div className="flex h-screen overflow-hidden text-txt-main font-sans bg-surface-app" dir="rtl">
      {/* Background Ambience for the whole app */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-atmosphere opacity-50"></div>
      
      <Sidebar 
        currentView={currentView}
        onNavigate={setCurrentView}
        dashboards={config.dashboards}
        activeDashboardId={activeDashboardId}
        onDashboardSelect={setActiveDashboardId}
        onAddDashboard={handleAddDashboard}
        onDeleteDashboard={handleDeleteDashboard}
        companyConfig={config.branding}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {currentView === 'dashboard' && (
          <DashboardView 
            activeDashboard={activeDashboard}
            mainCards={mainCards}
            companyConfig={config.branding}
            onNavigate={setCurrentView}
          />
        )}
        
        {currentView === 'settings' && (
          <SettingsView 
            activeDashboard={activeDashboard}
            mainCards={mainCards}
            activeMainCardId={activeMainCardId}
            activeSubCardId={activeSubCardId}
            activeMainCard={activeMainCard}
            activeSubCard={activeSubCard}
            onSelectMainCard={setActiveMainCardId}
            onSelectSubCard={setActiveSubCardId}
            onAddMainCard={handleAddMainCard}
            onDeleteMainCard={handleDeleteMainCard}
            onUpdateMainCard={handleUpdateMainCard}
            onReorderMainCards={handleReorderMainCards}
            onAddSubCard={handleAddSubCard}
            onDuplicateSubCard={handleDuplicateSubCard}
            onDeleteSubCard={handleDeleteSubCard}
            onUpdateSubCardInfo={handleUpdateSubCardInfo}
            onUpdateSubCardRules={handleUpdateSubCardRules}
            onSave={saveDraftNow}
            onReset={resetToDefault}
            onAddDashboard={handleAddDashboard}
          />
        )}

        {currentView === 'system_settings' && (
          <SystemSettingsView 
            onSave={saveDraftNow}
            onReset={resetToDefault}
          />
        )}

        {currentView === 'theme_settings' && (
          <ThemeSettingsView />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <UIProvider>
        <ModalProvider>
          <CompanyProvider>
            <VersionProvider>
              <MasterDataStoreProvider>
                <AuthProvider>
                  <SnapshotProvider>
                    <DataProvider>
                      <DashboardFiltersProvider>
                        <MainAppContent />
                      </DashboardFiltersProvider>
                    </DataProvider>
                  </SnapshotProvider>
                </AuthProvider>
              </MasterDataStoreProvider>
            </VersionProvider>
          </CompanyProvider>
        </ModalProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}
