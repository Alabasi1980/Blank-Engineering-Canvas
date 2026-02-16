
import React, { useState } from 'react';
import { Building2, Type, Calendar, PenTool } from 'lucide-react';
import { CompanyConfig, BrandingConfig } from '../../../types';
import { LogoManager } from './branding/LogoManager';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';
import { SettingHelpBlock } from './system/SettingHelpBlock';
import { GenericGuideModal } from './system/GenericGuideModal';

interface CompanyProfileSettingsProps {
  config: CompanyConfig;
  onUpdate: (updates: Partial<CompanyConfig>) => void;
}

export const CompanyProfileSettings: React.FC<CompanyProfileSettingsProps> = ({ config, onUpdate }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'terminology'>('branding');

  const updateBranding = (updates: Partial<BrandingConfig>) => {
    onUpdate({ branding: { ...config.branding, ...updates } });
  };

  const updateTerm = (group: string, key: string, val: string) => {
    onUpdate({
        terminology: {
            ...config.terminology,
            [group]: { ...(config.terminology[group] || {}), [key]: val }
        }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <SettingsSectionHeader 
        title="الهوية البصرية والمسميات"
        description="تخصيص شعار الجهة وقاموس المسميات التقنية لتناسب لغة عملك الخاصة."
        icon={Building2}
        iconColorClass="text-indigo-400"
        bgClass="bg-indigo-500/20"
      />

      <div className="flex bg-black/20 p-1 rounded-xl w-fit shadow-inner mb-6 border border-white/5">
          <button onClick={() => setActiveSubTab('branding')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'branding' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}>معلومات الجهة</button>
          <button onClick={() => setActiveSubTab('terminology')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'terminology' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}>قاموس النظام</button>
      </div>

      {activeSubTab === 'branding' && (
          <div className="card-fantasy p-8 space-y-8 relative overflow-hidden animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <LogoManager logo={config.branding.logo} onUpdate={(logo) => updateBranding({ logo })} />
                <div className="space-y-4">
                    <label className="label-fantasy">اسم الجهة / المشروع</label>
                    <input type="text" value={config.branding.companyName} onChange={e => updateBranding({ companyName: e.target.value })} className="input-fantasy" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={14}/> ترويسة التقارير</h4>
                    <input type="text" value={config.branding.reportHeader} onChange={e => updateBranding({ reportHeader: e.target.value })} className="input-fantasy" placeholder="عنوان التقرير..." />
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> تنسيقات عامة</h4>
                    <div className="flex gap-2">
                        <select value={config.branding.dateFormat} onChange={e => updateBranding({ dateFormat: e.target.value as any })} className="flex-1 input-fantasy cursor-pointer">
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        </select>
                        <select value={config.branding.numberFormat} onChange={e => updateBranding({ numberFormat: e.target.value as any })} className="flex-1 input-fantasy cursor-pointer">
                            <option value="standard">1,234.56</option>
                            <option value="european">1.234,56</option>
                        </select>
                    </div>
                </div>
            </div>
          </div>
      )}

      {activeSubTab === 'terminology' && (
          <div className="card-fantasy overflow-hidden animate-fade-in">
              <div className="bg-white/5 px-8 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-white/5">
                  <PenTool size={14} /> تخصيص مسميات محرك المعالجة
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                      { key: 'period_balance', label: 'الصافي خلال الفترة' },
                      { key: 'opening_balance', label: 'الرصيد الافتتاحي' },
                      { key: 'cumulative', label: 'الإجمالي التراكمي' }
                  ].map(item => (
                      <div key={item.key} className="space-y-2">
                          <label className="label-fantasy">مسمى: {item.label}</label>
                          <input 
                              type="text"
                              value={config.terminology['engine']?.[item.key] || ''}
                              onChange={e => updateTerm('engine', item.key, e.target.value)}
                              placeholder={item.label}
                              className="input-fantasy"
                          />
                      </div>
                  ))}
              </div>
          </div>
      )}

      <SettingHelpBlock 
        title="لماذا نوحد الهوية والمسميات؟"
        description="هذا القسم يضمن أن النظام يتحدث لغة شركتك. المسميات التي تضعها هنا ستظهر في كافة البطاقات، الجداول، والملفات المصدّرة للإدارة العليا."
        onClick={() => setShowHelp(true)}
        color="indigo"
      />

      <GenericGuideModal title="الهوية والقاموس الموحد" isOpen={showHelp} onClose={() => setShowHelp(false)}>
          <section>
              <h3 className="text-lg font-bold text-txt-main mb-2">توطين النظام (Localization)</h3>
              <p className="text-sm text-txt-secondary leading-relaxed">
                  هذا هو المكان الذي تمنح فيه التطبيق "شخصية" مؤسستك. يمكنك تغيير الشعار، وأيضاً تغيير المصطلحات التقنية الصعبة (مثل الرصيد الافتتاحي) بمسميات يفهمها موظفوك بسهولة.
              </p>
          </section>
      </GenericGuideModal>
    </div>
  );
};
