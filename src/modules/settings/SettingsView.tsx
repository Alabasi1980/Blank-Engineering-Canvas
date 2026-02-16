
import React from 'react';
import { ChevronLeft, Save, Database, PlusCircle, Layout } from 'lucide-react';
import { DashboardLayout, MainCard, SubCard, RuleRow } from '../../types';
import { Button } from '../../shared/components/Button';
import { MainCardList } from './components/MainCardList';
import { MainCardEditor } from './components/MainCardEditor';
import { SubCardEditor } from './components/SubCardEditor';
import { useCompany } from '../../context/CompanyContext';
import { EmptyState } from '../../shared/components/EmptyState';

interface SettingsViewProps {
  activeDashboard?: DashboardLayout;
  mainCards: MainCard[];
  activeMainCardId: string | null;
  activeSubCardId: string | null;
  activeMainCard?: MainCard;
  activeSubCard?: SubCard;
  
  onSelectMainCard: (id: string | null) => void;
  onSelectSubCard: (id: string | null) => void;
  
  onAddMainCard: (title: string) => void;
  onDeleteMainCard: (id: string) => void;
  onUpdateMainCard: (id: string, updates: Partial<MainCard>) => void;
  onReorderMainCards: (newOrder: MainCard[]) => void;
  
  onAddSubCard: () => void;
  onDuplicateSubCard?: (id: string) => void;
  onDeleteSubCard?: (id: string) => void;

  onUpdateSubCardInfo: (updates: Partial<SubCard>) => void;
  onUpdateSubCardRules: (rules: RuleRow[]) => void;
  
  onUpdateDashboardSource?: (sourceId: string) => void;

  onSave: () => void;
  onReset: () => void;
  onAddDashboard?: (title: string, icon: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeDashboard,
  mainCards,
  activeMainCardId,
  activeSubCardId,
  activeMainCard,
  activeSubCard,
  onSelectMainCard,
  onSelectSubCard,
  onAddMainCard,
  onDeleteMainCard,
  onUpdateMainCard,
  onReorderMainCards,
  onAddSubCard,
  onDuplicateSubCard,
  onDeleteSubCard,
  onUpdateSubCardInfo,
  onUpdateSubCardRules,
  onUpdateDashboardSource,
  onSave,
  onReset,
  onAddDashboard
}) => {
  const { config } = useCompany();

  if (!activeDashboard) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in text-txt-secondary bg-surface-app">
              <EmptyState 
                  icon={Layout}
                  title="لا توجد لوحة قيادة"
                  description="النظام الآن في حالة الصفر المطلق. ابدأ بإنشاء أول لوحة قيادة لتتمكن من إضافة مجموعات البطاقات وتصميم قواعد المحرك."
                  action={{
                      label: 'إنشاء أول لوحة قيادة',
                      onClick: () => onAddDashboard?.('لوحة القيادة الرئيسية', 'bar-chart'),
                      icon: <PlusCircle size={20} />
                  }}
                  className="bg-surface-card border border-border-subtle rounded-3xl"
              />
          </div>
      );
  }

  const systemDefaultSource = config.dataSources.find(ds => ds.id === config.defaultDataSourceId);
  const systemDefaultLabel = systemDefaultSource ? systemDefaultSource.label : 'غير محدد';

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative animate-fade-in bg-surface-app backdrop-blur-sm">
      {/* Header */}
      <header className="bg-surface-overlay border-b border-border-subtle p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm z-10 gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-sm text-txt-secondary mb-1">
             <span>الإعدادات</span>
             <ChevronLeft size={12} />
             <span className="text-primary-400 font-bold">{activeDashboard.title}</span>
          </div>
          <h2 className="text-2xl font-black text-txt-main tracking-tight">تهيئة بطاقات لوحة القيادة</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {/* Dashboard Data Source Selector */}
            {onUpdateDashboardSource && (
                <div className="flex items-center gap-2 bg-surface-input px-3 py-2 rounded-lg border border-border-subtle">
                    <Database size={16} className="text-purple-400" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-txt-muted uppercase tracking-wide">مصدر البيانات الافتراضي</span>
                        <select 
                            value={activeDashboard.defaultDataSourceId || ''} 
                            onChange={(e) => onUpdateDashboardSource(e.target.value)}
                            className="bg-transparent text-xs font-bold text-txt-main outline-none cursor-pointer min-w-[150px]"
                        >
                            <option value="">(افتراضي النظام: {systemDefaultLabel})</option>
                            {config.dataSources.map(ds => (
                                <option key={ds.id} value={ds.id}>{ds.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="h-8 w-px bg-border-subtle hidden md:block"></div>

            <div className="flex gap-3 w-full md:w-auto">
                <Button variant="secondary" onClick={onReset} className="flex-1 md:flex-none">إلغاء</Button>
                <Button icon={<Save size={18} />} onClick={onSave} className="flex-1 md:flex-none">حفظ التغييرات</Button>
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Cards List (Right Panel) */}
        <MainCardList 
          mainCards={mainCards} 
          activeMainCardId={activeMainCardId} 
          onSelect={(id) => {
            onSelectMainCard(id);
            onSelectSubCard(null);
          }}
          onAdd={() => {
              onAddMainCard('مجموعة جديدة');
          }}
          onDelete={onDeleteMainCard}
          onReorder={onReorderMainCards}
        />

        {/* Center Panel */}
        <div className={`flex-1 flex flex-col overflow-hidden relative ${!activeMainCardId ? 'hidden' : 'flex'}`}>
          
          {activeMainCardId && !activeSubCardId && activeMainCard && (
            <MainCardEditor 
              mainCard={activeMainCard}
              onUpdate={(updates) => onUpdateMainCard(activeMainCard.id, updates)}
              onDelete={() => onDeleteMainCard(activeMainCard.id)}
              onBack={() => onSelectMainCard(null)}
              onAddSubCard={onAddSubCard}
              onSelectSubCard={onSelectSubCard}
              onDuplicateSubCard={onDuplicateSubCard}
              onDeleteSubCard={onDeleteSubCard}
            />
          )}

          {activeMainCardId && activeSubCardId && activeSubCard && (
            <SubCardEditor 
              subCard={activeSubCard}
              mainCardTitle={activeMainCard?.title || ''}
              dashboardDefaultSourceId={activeDashboard.defaultDataSourceId} 
              onBack={() => onSelectSubCard(null)}
              onUpdateInfo={onUpdateSubCardInfo}
              onUpdateRules={onUpdateSubCardRules}
            />
          )}

        </div>
      </div>
    </main>
  );
};
