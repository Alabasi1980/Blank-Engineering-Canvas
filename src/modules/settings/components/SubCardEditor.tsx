
import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, LayoutList, Table, Eye, Bell, ShieldAlert, Plus, Trash2, GitBranch } from 'lucide-react';
import { SubCard, RuleRow, AlertRule } from '../../../types';
import { MetadataForm } from './MetadataForm';
import { ConfigurationTable } from './ConfigurationTable';
import { LivePreviewCard } from './LivePreviewCard';
import { LogicVisualizer } from './LogicVisualizer';
import { RuleTemplatesMenu } from './RuleTemplatesMenu';
import { useCompany } from '../../../context/CompanyContext';
import { EditorHeader } from './SubCardEditor/EditorHeader';
import { Button } from '../../../shared/components/Button';

type EditorTab = 'rules' | 'alerts';

interface SubCardEditorProps {
  subCard: SubCard; mainCardTitle: string; onBack: () => void;
  onUpdateInfo: (updates: Partial<SubCard>) => void;
  onUpdateRules: (rules: RuleRow[]) => void;
  dashboardDefaultSourceId?: string; // New prop
}

export const SubCardEditor: React.FC<SubCardEditorProps> = ({ 
    subCard, 
    mainCardTitle, 
    onBack, 
    onUpdateInfo, 
    onUpdateRules,
    dashboardDefaultSourceId 
}) => {
  const { config } = useCompany();
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('rules');
  const [isMetadataOpen, setIsMetadataOpen] = useState(true);
  
  const activeSchema = (config.tableSchemas || []).find(s => s.id === subCard.tableSchemaId) || config.tableSchemas?.[0];

  const handleUpdateAlerts = (newAlerts: AlertRule[]) => {
      onUpdateInfo({ alerts: newAlerts });
  };

  const addAlert = () => {
      const newAlert: AlertRule = {
          id: crypto.randomUUID(),
          label: 'تنبيه جديد',
          operator: 'greater_than',
          threshold: 0,
          severity: 'warning',
          message: '',
          enabled: true
      };
      handleUpdateAlerts([...(subCard.alerts || []), newAlert]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-app overflow-hidden relative">
      <EditorHeader onBack={onBack} mainCardTitle={mainCardTitle} subCardTitle={subCard.title} onPreview={() => setShowPreview(true)} />
      
      <div className="bg-surface-card border-b border-border-subtle z-20 shadow-sm shrink-0">
          <div className="px-6 py-2 flex justify-between items-center cursor-pointer hover:bg-surface-overlay" onClick={() => setIsMetadataOpen(!isMetadataOpen)}>
              <h4 className="text-xs font-bold text-txt-secondary uppercase tracking-widest">1. هوية البطاقة (Metadata)</h4>
              <div className="text-txt-secondary">{isMetadataOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
          </div>
          {isMetadataOpen && (
              <MetadataForm 
                {...subCard} 
                onChange={onUpdateInfo} 
                dashboardDefaultSourceId={dashboardDefaultSourceId} // Pass down
              />
          )}
      </div>

      <div className="bg-surface-card border-b border-border-subtle px-6 flex gap-1 shrink-0 z-10">
          <button onClick={() => setActiveTab('rules')} className={`py-4 px-6 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${activeTab === 'rules' ? 'border-primary-500 text-primary-400 bg-primary-500/10' : 'border-transparent text-txt-muted hover:text-txt-main'}`}>
              <LayoutList size={14}/> 2. قواعد المحرك (Engine Rules)
          </button>
          <button onClick={() => setActiveTab('alerts')} className={`py-4 px-6 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${activeTab === 'alerts' ? 'border-secondary text-secondary bg-secondary/10' : 'border-transparent text-txt-muted hover:text-txt-main'}`}>
              <Bell size={14}/> 3. المراقبين الذكيين (Watchdogs)
              {subCard.alerts && subCard.alerts.length > 0 && <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>}
          </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden m-4 glass-card border border-border-subtle shadow-xl">
           {activeTab === 'rules' ? (
               <>
                    <div className="p-5 bg-surface-overlay border-b border-border-subtle flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 font-black text-sm text-txt-main">
                                <GitBranch size={18} className="text-primary-500" />
                                <h3>معمارية معالجة الحركات</h3>
                            </div>
                            <div className="flex items-center gap-2 bg-surface-input px-3 py-1.5 rounded-xl border border-border-subtle">
                                <Table size={12} className="text-txt-muted ml-1" />
                                <select value={subCard.tableSchemaId || ''} onChange={e => onUpdateInfo({ tableSchemaId: e.target.value })} className="text-[10px] font-bold bg-transparent border-none outline-none text-txt-secondary cursor-pointer">
                                    <option value="">نموذج الجدول الافتراضي</option>
                                    {config.tableSchemas?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <RuleTemplatesMenu onApply={onUpdateRules} />
                    </div>
                    <LogicVisualizer rules={subCard.rules} />
                    <div className="flex-1 overflow-hidden">
                        <ConfigurationTable rules={subCard.rules} onChange={onUpdateRules} activeSchema={activeSchema} />
                    </div>
               </>
           ) : (
               <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8">
                   <div className="max-w-4xl mx-auto w-full space-y-8">
                       <div className="bg-secondary/10 p-6 rounded-3xl border border-secondary/20 flex gap-5 items-center">
                           <div className="p-4 bg-surface-card rounded-2xl shadow-sm text-secondary"><ShieldAlert size={32}/></div>
                           <div>
                               <h3 className="text-xl font-black text-txt-main">المراقبين الذكيين (Data Watchdogs)</h3>
                               <p className="text-xs text-txt-secondary leading-relaxed mt-1">
                                   قم بتعريف حواجز الحماية والقواعد الرقابية. عندما يحقق ناتج البطاقة شرطاً معيناً، سيقوم النظام بتنبيه المستخدم بأسلوب بصري ذكي.
                               </p>
                           </div>
                           <Button onClick={addAlert} className="mr-auto !bg-secondary hover:brightness-110 text-white" icon={<Plus size={16}/>}>إضافة مراقب</Button>
                       </div>

                       <div className="space-y-4">
                           {(!subCard.alerts || subCard.alerts.length === 0) ? (
                               <div className="py-20 text-center text-txt-muted flex flex-col items-center">
                                   <Bell size={48} className="mb-4 opacity-10" />
                                   <p className="font-bold">لا يوجد مراقبين مفعلين لهذه البطاقة</p>
                                   <p className="text-[10px] mt-1">ابدأ بإضافة قواعد تنبيه مثل: "تنبيه إذا تجاوز الإجمالي 1,000,000"</p>
                               </div>
                           ) : (
                               subCard.alerts.map(alert => (
                                   <div key={alert.id} className={`p-6 rounded-3xl border-2 transition-all flex flex-col md:flex-row gap-6 items-center ${alert.enabled ? 'bg-surface-card border-border-subtle shadow-sm' : 'bg-surface-app border-transparent opacity-50'}`}>
                                       <div className="flex-1 w-full space-y-4">
                                           <div className="flex gap-4">
                                               <div className="flex-1">
                                                   <label className="block text-[10px] font-black text-txt-muted uppercase mb-1">مسمى التنبيه</label>
                                                   <input 
                                                       value={alert.label} 
                                                       onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, label: e.target.value} : a))}
                                                       className="w-full text-sm font-bold p-2 border-b border-border-subtle outline-none focus:border-secondary bg-transparent text-txt-main"
                                                       placeholder="مثال: تجاوز الميزانية المعتمدة"
                                                   />
                                               </div>
                                               <div className="w-32">
                                                   <label className="block text-[10px] font-black text-txt-muted uppercase mb-1">المستوى</label>
                                                   <select 
                                                        value={alert.severity}
                                                        onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, severity: e.target.value as any} : a))}
                                                        className={`w-full text-xs font-black p-2 rounded-xl outline-none border ${alert.severity === 'danger' ? 'bg-red-500/20 text-red-400 border-red-500/30' : alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}
                                                   >
                                                       <option value="danger">خطر (Danger)</option>
                                                       <option value="warning">تحذير (Warning)</option>
                                                       <option value="info">إرشاد (Info)</option>
                                                   </select>
                                               </div>
                                           </div>

                                           <div className="flex flex-wrap items-center gap-3 bg-surface-input p-4 rounded-2xl border border-border-subtle">
                                               <span className="text-xs font-bold text-txt-secondary">في حال كان الإجمالي</span>
                                               <select 
                                                   value={alert.operator}
                                                   onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, operator: e.target.value as any} : a))}
                                                   className="text-xs font-black p-2 border border-border-subtle rounded-lg outline-none bg-surface-card text-txt-main"
                                               >
                                                   <option value="greater_than">أكبر من (>)</option>
                                                   <option value="less_than">أصغر من (&lt;)</option>
                                                   <option value="equals">يساوي (=)</option>
                                               </select>
                                               <input 
                                                   type="number"
                                                   value={alert.threshold}
                                                   onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, threshold: Number(e.target.value)} : a))}
                                                   className="flex-1 min-w-[120px] text-sm font-mono font-black p-2 border border-border-subtle rounded-lg outline-none text-left bg-surface-card text-txt-main"
                                                   dir="ltr"
                                               />
                                           </div>
                                       </div>

                                       <div className="flex items-center gap-3 md:border-r md:pr-6 md:border-border-subtle shrink-0">
                                           <button 
                                                onClick={() => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, enabled: !a.enabled} : a))}
                                                className={`p-3 rounded-2xl transition-all ${alert.enabled ? 'bg-green-500/20 text-green-400 shadow-inner' : 'bg-surface-input text-txt-muted'}`}
                                           >
                                               {alert.enabled ? <ShieldAlert size={20}/> : <Trash2 size={20}/>}
                                           </button>
                                           <button 
                                                onClick={() => handleUpdateAlerts(subCard.alerts!.filter(a => a.id !== alert.id))}
                                                className="p-3 text-txt-muted hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                                           >
                                               <Trash2 size={20}/>
                                           </button>
                                       </div>
                                   </div>
                               ))
                           )}
                       </div>
                   </div>
               </div>
           )}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-overlay backdrop-blur-sm" onClick={() => setShowPreview(false)}></div>
            <div className="relative bg-surface-card rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up border border-border-subtle">
                <div className="flex justify-between items-center p-4 border-b border-border-subtle">
                    <h3 className="font-bold flex items-center gap-2 text-txt-main"><Eye size={16} className="text-primary-400" />معاينة النتيجة</h3>
                    <button onClick={() => setShowPreview(false)}><X size={20} className="text-txt-muted" /></button>
                </div>
                <div className="p-6 bg-surface-app rounded-b-2xl"><LivePreviewCard card={subCard} /></div>
            </div>
        </div>
      )}
    </div>
  );
};
