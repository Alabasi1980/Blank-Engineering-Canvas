
import React, { useState } from 'react';
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

  onSave: () => void | Promise<void>;
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
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
      setIsSaving(true);
      try {
          await onSave();
      } finally {
          setIsSaving(false);
      }
  };

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
    <div className="flex-1 flex overflow-hidden h-screen bg-surface-app" dir="rtl">
      {/* 1. Static Sidebar (Main Group List) */}
      <MainCardList 
        mainCards={mainCards} 
        activeMainCardId={activeMainCardId} 
        onSelect={(id) => {
          onSelectMainCard(id);
          onSelectSubCard(null);
        }}
        onAdd={() => onAddMainCard('مجموعة جديدة')}
        onDelete={onDeleteMainCard}
        onReorder={onReorderMainCards}
      />

      {/* 2. Content Pane (Header + Scrollable Body) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Unified Sticky Header */}
        <header className="bg-surface-overlay border-b border-border-subtle backdrop-blur-md px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 z-20 shadow-sm gap-4">
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-txt-secondary mb-0.5">
                 <span>إدارة البطاقات</span>
                 <ChevronLeft size={10} />
                 <span className="text-primary-400 font-bold">{activeDashboard.title}</span>
              </div>
              <h2 className="text-lg font-black text-txt-main tracking-tight">تهيئة القواعد والبطاقات</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                {onUpdateDashboardSource && (
                    <div className="flex items-center gap-2 bg-surface-input px-3 py-1.5 rounded-xl border border-border-subtle">
                        <Database size={14} className="text-purple-400" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-txt-muted uppercase tracking-wide">المصدر الافتراضي</span>
                            <select 
                                value={activeDashboard.defaultDataSourceId || ''} 
                                onChange={(e) => onUpdateDashboardSource(e.target.value)}
                                className="bg-transparent text-[10px] font-bold text-txt-main outline-none cursor-pointer min-w-[120px]"
                            >
                                <option value="">(افتراضي: {systemDefaultLabel})</option>
                                {config.dataSources.map(ds => (
                                    <option key={ds.id} value={ds.id}>{ds.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="h-8 w-px bg-border-subtle hidden md:block"></div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="ghost" onClick={onReset} size="sm">إعادة تعيين</Button>
                    <Button icon={<Save size={16} />} onClick={handleSave} loading={isSaving} size="sm" className="shadow-lg shadow-primary-500/20">حفظ التغييرات</Button>
                </div>
            </div>
          </div>
        </header>

        {/* Unified Single Scroll Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-surface-app/30">
          <div className="max-w-6xl mx-auto px-8 py-8 pb-24">
            {!activeMainCardId ? (
              <div className="flex flex-col items-center justify-center py-32 text-txt-muted animate-fade-in">
                <Layout size={64} className="opacity-10 mb-4" />
                <h3 className="text-xl font-black">اختر مجموعة للبدء</h3>
                <p className="text-sm">حدد إحدى مجموعات البطاقات من القائمة اليمنى لتعديل قواعدها.</p>
              </div>
            ) : (
              <div className="animate-fade-in">
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
