
import React, { useMemo, useEffect, useState } from 'react';
import { MainCard, BrandingConfig, DashboardLayout } from '../../types';
import { DashboardWidget } from '../../components/DashboardWidget';
import { FileText, Settings, Layout, Sparkles, Box, Wand2, Database } from 'lucide-react';
import { useData } from '../../core/context/DataContext';
import { useCompany } from '../../context/CompanyContext';
import { useDashboardFilters } from '../../core/context/DashboardFiltersContext';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardFilterBar } from './components/DashboardFilterBar';
import { EmptyState } from '../../shared/components/EmptyState';
import { CARD_COLORS } from '../../constants';
import { WelcomeGuide } from './components/welcome/WelcomeGuide';
import { Button } from '../../shared/components/Button';

interface DashboardViewProps {
  activeDashboard?: DashboardLayout; 
  mainCards: MainCard[];
  selectedDate?: Date;
  companyConfig: BrandingConfig;
  onDateChange?: (date: Date) => void;
  onNavigate?: (view: 'dashboard' | 'settings' | 'system_settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  activeDashboard,
  mainCards, 
  companyConfig,
  onNavigate
}) => {
  const { config } = useCompany(); 
  const { filters, setFilters } = useDashboardFilters();
  const activeMainCards = mainCards.filter(mc => mc.subCards.length > 0);
  const { getFilterOptions } = useData();
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
      if (!filters.dateFrom || !filters.dateTo) {
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          
          setFilters({ 
              dateFrom: startOfMonth.toISOString().split('T')[0], 
              dateTo: endOfMonth.toISOString().split('T')[0] 
          });
      }
  }, [setFilters, filters.dateFrom, filters.dateTo]);

  const effectiveDate = useMemo(() => {
      return filters.dateFrom ? new Date(filters.dateFrom) : new Date();
  }, [filters.dateFrom]);

  const filterOptions = useMemo(() => getFilterOptions(), [getFilterOptions, config.dimensionsRegistry]);

  if (config.dashboards.length === 0) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-surface-app">
              <div className="relative z-10 max-w-2xl space-y-8 animate-fade-in-up">
                  <div className="inline-flex items-center gap-2 bg-surface-card px-4 py-2 rounded-full border border-border-highlight text-primary-400 text-xs font-black uppercase tracking-[0.2em]">
                      <Sparkles size={14}/> مرحباً بك في أرض الاحتمالات
                  </div>
                  
                  <h1 className="text-5xl font-black text-txt-main tracking-tight leading-tight">
                      أنت الآن تمتلك القوة <br/> <span className="text-primary-500">لبناء الحقيقة الخاصة بك</span>
                  </h1>
                  
                  <p className="text-txt-secondary text-lg leading-relaxed">
                      هذا النظام يبدأ كـ "وعاء فارغ". أنت من يحدد الأبعاد، القواعد، والمنطق. لا يوجد حدود لما يمكنك مراقبته وتحليله.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                      <div className="glass-panel p-6 rounded-2xl">
                          <Box className="text-blue-500 mb-3 mx-auto" size={32} />
                          <h4 className="text-txt-main font-bold text-sm">حدد الأبعاد</h4>
                      </div>
                      <div className="glass-panel p-6 rounded-2xl">
                          <Wand2 className="text-purple-500 mb-3 mx-auto" size={32} />
                          <h4 className="text-txt-main font-bold text-sm">صمم المنطق</h4>
                      </div>
                      <div className="glass-panel p-6 rounded-2xl">
                          <Database className="text-emerald-500 mb-3 mx-auto" size={32} />
                          <h4 className="text-txt-main font-bold text-sm">استورد البيانات</h4>
                      </div>
                  </div>

                  <div className="pt-8 flex justify-center">
                      <Button onClick={() => onNavigate?.('system_settings')} size="lg" icon={<Layout size={20} />}>
                          ابدأ هندسة النظام الآن
                      </Button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto font-sans flex flex-col relative custom-scrollbar bg-surface-app">
      <DashboardHeader companyConfig={companyConfig} onOpenGuide={() => setShowWelcome(true)} />
      <div className="sticky top-0 z-40">
        <DashboardFilterBar filterOptions={filterOptions} />
      </div>

      <div className="max-w-6xl mx-auto w-full px-8 py-8 space-y-10 min-h-[500px]">
        {activeMainCards.length > 0 ? (
            activeMainCards.map((mainCard, sectionIdx) => {
                const theme = CARD_COLORS.find(c => c.value === mainCard.color) || CARD_COLORS[0];
                return (
                    <div 
                        key={mainCard.id} 
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${sectionIdx * 100}ms` }}
                    >
                        {/* Section Header */}
                        <div className="flex items-center gap-4 mb-6 px-2">
                            <div className={`p-3 rounded-2xl bg-surface-card border border-border-subtle ${theme.text} shadow-lg backdrop-blur-sm`}>
                                <Layout size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-txt-main leading-none tracking-tight">{mainCard.title}</h2>
                                <p className="text-xs text-txt-secondary mt-1 font-medium flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-txt-muted"></span>
                                    <span>مجموعة مؤشرات استراتيجية</span>
                                </p>
                            </div>
                            <div className="mr-auto h-[1px] flex-1 bg-gradient-to-r from-border-subtle to-transparent mx-6"></div>
                            <span className="text-[10px] font-bold text-txt-muted bg-surface-card px-3 py-1 rounded-full border border-border-subtle">
                                {mainCard.subCards.length} بطاقات
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {mainCard.subCards.map(subCard => (
                                <div key={subCard.id} className="h-full">
                                    <DashboardWidget 
                                        card={subCard} 
                                        selectedDate={effectiveDate}
                                        dashboardDataSourceId={activeDashboard?.defaultDataSourceId}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })
        ) : (
            <EmptyState 
                icon={FileText}
                title="مجموعة البطاقات فارغة"
                description="لم يتم إضافة أي بطاقات لهذه اللوحة بعد. يمكنك البدء بتخصيص اللوحة وإضافة مؤشرات الأداء."
                action={onNavigate ? {
                    label: 'تهيئة البطاقات',
                    onClick: () => onNavigate('settings'),
                    icon: <Settings size={16} />
                } : undefined}
            />
        )}
      </div>

      <div className="mt-auto border-t border-border-subtle p-6 bg-surface-overlay backdrop-blur-md text-center text-xs text-txt-secondary font-medium">
          {companyConfig.reportFooter}
      </div>

      <WelcomeGuide 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)} 
        onNavigate={onNavigate}
      />
    </div>
  );
};
