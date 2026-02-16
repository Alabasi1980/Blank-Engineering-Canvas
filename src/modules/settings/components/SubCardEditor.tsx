
import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, LayoutList, Table, Eye, Bell, ShieldAlert, Plus, Trash2, GitBranch, ShieldCheck } from 'lucide-react';
import { SubCard, RuleRow, AlertRule } from '../../../types';
import { MetadataForm } from './MetadataForm';
import { ConfigurationTable } from './ConfigurationTable';
import { LivePreviewCard } from './LivePreviewCard';
import { LogicVisualizer } from './LogicVisualizer';
import { RuleTemplatesMenu } from './RuleTemplatesMenu';
import { useCompany } from '../../../context/CompanyContext';
import { Button } from '../../../shared/components/Button';

type EditorTab = 'rules' | 'alerts';

interface SubCardEditorProps {
  subCard: SubCard;
  mainCardTitle: string;
  onBack: () => void;
  onUpdateInfo: (updates: Partial<SubCard>) => void;
  onUpdateRules: (rules: RuleRow[]) => void;
  dashboardDefaultSourceId?: string;
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
    <div className="space-y-6">
      {/* 1. Header & Quick Navigation */}
      <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 text-xs text-txt-secondary">
            <button onClick={onBack} className="hover:text-primary-400 flex items-center gap-1 transition-colors font-bold">
                <X size={16} />
                <span>إغلاق المحرر</span>
            </button>
            <span className="text-border-highlight opacity-30">|</span>
            <span className="font-bold text-txt-main">{subCard.title}</span>
        </div>
        
        {/* Task #5: Unified Button Component for Preview */}
        <Button 
            onClick={() => setShowPreview(true)} 
            variant="primary" 
            size="sm" 
            icon={<Eye size={14} />}
            className="shadow-lg shadow-primary-900/20 font-black"
        >
            معاينة النتيجة
        </Button>
      </div>
      
      {/* 2. Metadata Section */}
      <div className="glass-card overflow-hidden border border-border-subtle rounded-3xl bg-surface-card">
          <div className="px-6 py-3 flex justify-between items-center cursor-pointer hover:bg-surface-overlay bg-surface-overlay/50 border-b border-border-subtle" onClick={() => setIsMetadataOpen(!isMetadataOpen)}>
              <h4 className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">1. تعريف الهوية والبيانات (Metadata)</h4>
              <div className="text-txt-muted">{isMetadataOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
          </div>
          {isMetadataOpen && (
              <MetadataForm 
                {...subCard} 
                onChange={onUpdateInfo} 
                dashboardDefaultSourceId={dashboardDefaultSourceId}
              />
          )}
      </div>

      {/* 3. Logical Engine Section */}
      <div className="glass-card border border-border-subtle rounded-[2.5rem] overflow-hidden bg-surface-card flex flex-col shadow-xl">
          <div className="border-b border-border-subtle px-4 flex gap-1 bg-surface-overlay shrink-0">
              <button onClick={() => setActiveTab('rules')} className={`py-5 px-6 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${activeTab === 'rules' ? 'border-primary-500 text-primary-400' : 'border-transparent text-txt-muted hover:text-txt-main'}`}>
                  <LayoutList size={16}/> 2. قواعد المعالجة (Engine Rules)
              </button>
              <button onClick={() => setActiveTab('alerts')} className={`py-5 px-6 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${activeTab === 'alerts' ? 'border-secondary text-secondary' : 'border-transparent text-txt-muted hover:text-txt-main'}`}>
                  <Bell size={16}/> 3. المراقبين (Watchdogs)
                  {subCard.alerts && subCard.alerts.length > 0 && <span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_var(--color-secondary)]"></span>}
              </button>
          </div>

          <div className="flex-1">
               {activeTab === 'rules' ? (
                   <>
                        <div className="p-6 bg-surface-overlay/30 border-b border-border-subtle flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 font-black text-sm text-txt-main">
                                    <GitBranch size={18} className="text-primary-500" />
                                    <h3>معمارية المحرك</h3>
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
                        <div className="overflow-x-auto custom-scrollbar">
                            <ConfigurationTable rules={subCard.rules} onChange={onUpdateRules} activeSchema={activeSchema} />
                        </div>
                   </>
               ) : (
                   <div className="p-8 space-y-8 animate-fade-in">
                       <div className="bg-secondary/10 p-6 rounded-3xl border border-secondary/20 flex gap-6 items-center">
                           <div className="p-4 bg-surface-card rounded-2xl shadow-lg text-secondary border border-secondary/20"><ShieldAlert size={32}/></div>
                           <div className="flex-1">
                               <h3 className="text-xl font-black text-txt-main">نظام المراقبين الذكي (Data Watchdogs)</h3>
                               <p className="text-xs text-txt-secondary leading-relaxed mt-1 font-medium">
                                   قم بتعريف حواجز الحماية والقواعد الرقابية. سيقوم النظام بتغيير لون البطاقة للبرتقالي أو الأحمر إذا تجاوزت القيم حواجز الحماية.
                               </p>
                           </div>
                           <Button onClick={addAlert} variant="secondary" className="!bg-secondary/20 hover:!bg-secondary text-secondary hover:text-white border-secondary/30" icon={<Plus size={16}/>}>إضافة مراقب</Button>
                       </div>

                       <div className="grid grid-cols-1 gap-4">
                           {(!subCard.alerts || subCard.alerts.length === 0) ? (
                               <div className="py-20 text-center text-txt-muted flex flex-col items-center bg-surface-input/30 rounded-3xl border-2 border-dashed border-border-subtle">
                                   <Bell size={48} className="mb-4 opacity-10" />
                                   <p className="font-bold">لا توجد قواعد رقابة مفعلة</p>
                                   <p className="text-[10px] mt-1">ابدأ بإضافة مراقب لتتبع التجاوزات المالية.</p>
                               </div>
                           ) : (
                               subCard.alerts.map(alert => (
                                   <div key={alert.id} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col md:flex-row gap-6 items-center ${alert.enabled ? 'bg-surface-card border-border-subtle shadow-lg' : 'bg-surface-app border-transparent opacity-40 grayscale'}`}>
                                       <div className="flex-1 w-full space-y-4">
                                           <div className="flex gap-4">
                                               <div className="flex-1">
                                                   <label className="block text-[10px] font-black text-txt-muted uppercase mb-1.5 tracking-wider">مسمى القاعدة الرقابية</label>
                                                   <input 
                                                       value={alert.label} 
                                                       onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, label: e.target.value} : a))}
                                                       className="w-full text-sm font-black p-2 border-b border-border-subtle outline-none focus:border-secondary bg-transparent text-txt-main"
                                                       placeholder="مثال: تجاوز السقف المالي..."
                                                   />
                                               </div>
                                               <div className="w-40">
                                                   <label className="block text-[10px] font-black text-txt-muted uppercase mb-1.5 tracking-wider">مستوى الخطورة</label>
                                                   <select 
                                                        value={alert.severity}
                                                        onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, severity: e.target.value as any} : a))}
                                                        className={`w-full text-xs font-black p-2.5 rounded-xl outline-none border transition-all cursor-pointer ${alert.severity === 'danger' ? 'bg-red-500/10 text-red-400 border-red-500/30' : alert.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}
                                                   >
                                                       <option value="danger">خطر (Danger)</option>
                                                       <option value="warning">تحذير (Warning)</option>
                                                       <option value="info">إرشاد (Info)</option>
                                                   </select>
                                               </div>
                                           </div>

                                           <div className="flex flex-wrap items-center gap-3 bg-surface-input/50 p-4 rounded-2xl border border-border-subtle">
                                               <span className="text-xs font-bold text-txt-secondary">إذا كان إجمالي البطاقة</span>
                                               <select 
                                                   value={alert.operator}
                                                   onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, operator: e.target.value as any} : a))}
                                                   className="text-xs font-black p-2 border border-border-subtle rounded-lg outline-none bg-surface-card text-txt-main cursor-pointer"
                                               >
                                                   <option value="greater_than">أكبر من (>)</option>
                                                   <option value="less_than">أصغر من (&lt;)</option>
                                                   <option value="equals">يساوي (=)</option>
                                               </select>
                                               <input 
                                                   type="number"
                                                   value={alert.threshold}
                                                   onChange={e => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, threshold: Number(e.target.value)} : a))}
                                                   className="flex-1 min-w-[120px] text-sm font-mono font-black p-2 border border-border-subtle rounded-lg outline-none text-left bg-surface-card text-txt-main focus:border-secondary"
                                                   dir="ltr"
                                               />
                                           </div>
                                       </div>

                                       <div className="flex items-center gap-2 md:border-r md:pr-6 md:border-border-subtle shrink-0">
                                           <button 
                                                onClick={() => handleUpdateAlerts(subCard.alerts!.map(a => a.id === alert.id ? {...a, enabled: !a.enabled} : a))}
                                                className={`p-4 rounded-2xl transition-all ${alert.enabled ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-inner' : 'bg-surface-input text-txt-muted'}`}
                                                title={alert.enabled ? "المراقب نشط" : "تفعيل المراقب"}
                                           >
                                               <ShieldCheck size={20}/>
                                           </button>
                                           <button 
                                                onClick={() => handleUpdateAlerts(subCard.alerts!.filter(a => a.id !== alert.id))}
                                                className="p-4 text-txt-muted hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                                                title="حذف القاعدة"
                                           >
                                               <Trash2 size={20}/>
                                           </button>
                                       </div>
                                   </div>
                               ))
                           )}
                       </div>
                   </div>
               )}
          </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPreview(false)}></div>
            <div className="relative bg-surface-card rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up border border-border-subtle overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-border-subtle bg-surface-overlay">
                    <h3 className="font-black text-sm flex items-center gap-2 text-txt-main uppercase tracking-widest"><Eye size={18} className="text-primary-400" /> معاينة الناتج الحي</h3>
                    <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} className="text-txt-muted" /></button>
                </div>
                <div className="p-8 bg-surface-app"><LivePreviewCard card={subCard} /></div>
                <div className="p-4 bg-surface-overlay text-center border-t border-border-subtle">
                   <p className="text-[10px] text-txt-muted font-bold">هذه المعاينة تعكس تطبيق القواعد الحالية على البيانات المخزنة.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
