
import React, { useState } from 'react';
import { useCompany } from '../../context/CompanyContext';
import { SystemSettingsSidebar, SettingsTab } from './components/system/SystemSettingsSidebar';
import { CompanyProfileSettings } from './components/CompanyProfileSettings';
import { DimensionManager } from './components/system/DimensionManager';
import { LogicArchitect } from './components/system/LogicArchitect';
import { CurrencySettings } from './components/system/CurrencySettings';
import { TableSchemaSettings } from './components/TableSchemaSettings';
import { DataImportPanel } from './components/DataImportPanel';
import { DataStorageManager } from './components/DataStorageManager';
import { IntegrationManager } from './components/integrations/IntegrationManager';
import { VersionsPanel } from './components/VersionsPanel';
import { MasterEntitiesSettings } from './components/MasterEntitiesSettings';
import { MasterListDataManager } from './components/MasterListDataManager';
import { IntegrityCenterPanel } from './components/IntegrityCenterPanel';
import { Save, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../../shared/components/Button';

/**
 * SystemSettingsView
 * Main orchestrator for system architecture configuration.
 */
export const SystemSettingsView: React.FC<any> = ({ onSave, onReset }) => {
  const { config, updateConfig } = useCompany();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': 
        return <CompanyProfileSettings config={config} onUpdate={updateConfig} />;
      case 'dimensions': 
        return <DimensionManager />;
      case 'logic_architect': 
        return <LogicArchitect />;
      case 'currency': 
        return <CurrencySettings />;
      case 'table_views': 
        return <TableSchemaSettings />;
      case 'import': 
        return <DataImportPanel />;
      case 'storage': 
        return <DataStorageManager />;
      case 'integrations': 
        return <IntegrationManager />;
      case 'versions': 
        return <VersionsPanel />;
      case 'list_meta': 
        return <MasterEntitiesSettings />;
      case 'list_data': 
        return <MasterListDataManager />;
      case 'integrity_center': 
        return <IntegrityCenterPanel />;
      default: 
        return <CompanyProfileSettings config={config} onUpdate={updateConfig} />;
    }
  };

  const getPhaseInfo = () => {
      if (['profile', 'dimensions', 'list_meta'].includes(activeTab)) return { num: 1, label: 'مرحلة التأسيس: بناء الهيكل العظمي للنظام' };
      if (['logic_architect', 'currency', 'table_views'].includes(activeTab)) return { num: 2, label: 'مرحلة الذكاء: صياغة قواعد المعالجة والمنطق' };
      if (['import', 'list_data', 'integrations', 'storage'].includes(activeTab)) return { num: 3, label: 'مرحلة الجلب: بناء جسور البيانات وتدفق المعلومات' };
      return { num: 4, label: 'مرحلة الحوكمة: ضمان النزاهة وإدارة الإصدارات' };
  };

  const phase = getPhaseInfo();

  return (
    <div className="flex-1 flex overflow-hidden h-screen bg-surface-app" dir="rtl">
      <SystemSettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-surface-overlay border-b border-border-subtle backdrop-blur-md px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 z-20 shadow-sm gap-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center font-black text-txt-main border border-border-subtle shadow-inner">
                    {phase.num}
                </div>
                <div>
                    <h2 className="text-sm font-black text-txt-main tracking-tight">{phase.label}</h2>
                    <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest mt-0.5">System Architect Environment</p>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <Button variant="secondary" onClick={onReset} icon={<RefreshCw size={16}/>} className="!bg-surface-card !text-txt-secondary hover:!bg-surface-overlay">تحديث</Button>
                <Button onClick={onSave} icon={<Save size={16}/>} className="shadow-lg shadow-primary-500/20">حفظ كافة الإعدادات</Button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <div className="max-w-6xl mx-auto pb-20">
            {renderContent()}
          </div>
        </main>

        <div className="bg-surface-overlay border-t border-border-subtle p-4 shrink-0 flex items-center justify-between z-10 backdrop-blur-md">
            <div className="flex items-center gap-6">
                {[1,2,3,4].map(n => (
                    <div key={n} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${n <= phase.num ? 'bg-primary-600 text-white shadow-neon' : 'bg-surface-card text-txt-muted'}`}>
                            {n}
                        </div>
                        <div className={`h-1 w-12 rounded-full ${n < phase.num ? 'bg-primary-600' : 'bg-surface-card'}`}></div>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                <Layers size={14}/>
                <span>EIS Unified Architect v3.0 (Configurator Mode)</span>
            </div>
        </div>
      </div>
    </div>
  );
};
