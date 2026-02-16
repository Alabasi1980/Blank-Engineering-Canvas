import { useState, useEffect } from 'react';
import { MainCard, SubCard, RuleRow } from '../types';
import { useCompany } from '../context/CompanyContext';
import { useModal } from '../context/ModalContext';
import { PersistenceService } from '../core/services/PersistenceService';
import { DashboardService } from '../core/services/DashboardService';

export const useDashboardManagement = () => {
  const { config, updateConfig } = useCompany();
  const { confirm } = useModal();
  
  const [activeDashboardId, setActiveDashboardIdState] = useState(() => 
      PersistenceService.get('active_dashboard_id', '')
  );
  const [activeMainCardId, setActiveMainCardId] = useState<string | null>(null);
  const [activeSubCardId, setActiveSubCardId] = useState<string | null>(null);

  const setActiveDashboardId = (id: string) => { 
      setActiveDashboardIdState(id); 
      PersistenceService.set('active_dashboard_id', id); 
  };

  useEffect(() => {
      if (config.dashboards.length > 0 && (!activeDashboardId || !config.dashboards.find(d => d.id === activeDashboardId))) {
          setActiveDashboardId(config.dashboards[0].id);
      }
  }, [config.dashboards, activeDashboardId]);

  const getCurrentDashboard = () => config.dashboards.find(d => d.id === activeDashboardId);

  const updateCurrentDash = (updates: any) => {
      updateConfig({
          dashboards: config.dashboards.map(d => d.id === activeDashboardId ? { ...d, ...updates } : d)
      });
  };

  const handleAddDashboard = (title: string, icon: string) => {
      const newDash = DashboardService.createDashboard(title, icon);
      updateConfig({ dashboards: [...config.dashboards, newDash] });
      setActiveDashboardId(newDash.id);
  };

  const handleDeleteDashboard = async (id: string) => {
      if (await confirm({ title: 'حذف لوحة القيادة', message: 'هل أنت متأكد من حذف اللوحة بكافة محتوياتها؟', variant: 'danger' })) {
          updateConfig({ dashboards: config.dashboards.filter(d => d.id !== id) });
      }
  };

  const handleAddMainCard = (title: string = 'مجموعة جديدة') => {
      const current = getCurrentDashboard();
      if (!current) return;
      const newCard = DashboardService.createMainCard(title);
      updateCurrentDash({ mainCards: [...current.mainCards, newCard] });
      setActiveMainCardId(newCard.id);
  };

  const handleAddSubCard = () => {
    const current = getCurrentDashboard();
    const main = current?.mainCards.find(m => m.id === activeMainCardId);
    if (!main) return;
    
    const newSub = DashboardService.createSubCard('بطاقة جديدة', main.color);
    const newMainCards = current!.mainCards.map(m => 
        m.id === activeMainCardId ? { ...m, subCards: [...m.subCards, newSub] } : m
    );
    updateCurrentDash({ mainCards: newMainCards });
    setActiveSubCardId(newSub.id);
  };

  const handleDuplicateSubCard = (subCardId: string) => {
     const current = getCurrentDashboard();
     if (!current) return;
     const newMainCards = current.mainCards.map(m => {
         if (m.id !== activeMainCardId) return m;
         const original = m.subCards.find(s => s.id === subCardId);
         return original ? { ...m, subCards: [...m.subCards, DashboardService.duplicateSubCard(original)] } : m;
     });
     updateCurrentDash({ mainCards: newMainCards });
  };

  return {
      activeDashboardId, setActiveDashboardId, activeMainCardId, setActiveMainCardId, activeSubCardId, setActiveSubCardId,
      handleAddDashboard, handleDeleteDashboard, 
      handleAddMainCard, handleAddSubCard, handleDuplicateSubCard,
      handleUpdateMainCard: (id: string, updates: any) => {
          const current = getCurrentDashboard();
          if (current) updateCurrentDash({ mainCards: current.mainCards.map(c => c.id === id ? { ...c, ...updates } : c) });
      },
      handleReorderMainCards: (newMainCards: MainCard[]) => updateCurrentDash({ mainCards: newMainCards }),
      handleDeleteMainCard: async (id: string) => { 
          if(await confirm({ title: 'حذف مجموعة', message: 'تأكيد الحذف؟', variant: 'danger' })) {
              const current = getCurrentDashboard();
              if (current) updateCurrentDash({ mainCards: current.mainCards.filter(c => c.id !== id) });
          }
      },
      handleDeleteSubCard: async (id: string) => { 
          if(await confirm({ title: 'حذف بطاقة', message: 'تأكيد الحذف؟', variant: 'danger' })) {
              const current = getCurrentDashboard();
              if (current) updateCurrentDash({ mainCards: current.mainCards.map(m => m.id === activeMainCardId ? { ...m, subCards: m.subCards.filter(s => s.id !== id) } : m) });
          }
      },
      handleUpdateSubCardRules: (rules: RuleRow[]) => {
          const current = getCurrentDashboard();
          if (current) updateCurrentDash({ mainCards: current.mainCards.map(m => m.id === activeMainCardId ? { ...m, subCards: m.subCards.map(s => s.id === activeSubCardId ? { ...s, rules } : s) } : m) });
      },
      handleUpdateSubCardInfo: (updates: any) => {
          const current = getCurrentDashboard();
          if (current) updateCurrentDash({ mainCards: current.mainCards.map(m => m.id === activeMainCardId ? { ...m, subCards: m.subCards.map(s => s.id === activeSubCardId ? { ...s, ...updates } : s) } : m) });
      }
  };
};