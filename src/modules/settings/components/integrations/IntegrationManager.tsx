
import React, { useState } from 'react';
import { Globe, Plus, Trash2, Edit, Wifi, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useCompany } from '../../../../context/CompanyContext';
import { Button } from '../../../../shared/components/Button';
import { IntegrationProfile } from '../../../../types';
import { ProfileEditorModal } from './ProfileEditorModal';
import { useModal } from '../../../../context/ModalContext';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { SettingsSectionHeader } from '../system/SettingsSectionHeader';
import { SettingHelpBlock } from '../system/SettingHelpBlock';
import { GenericGuideModal } from '../system/GenericGuideModal';

export const IntegrationManager: React.FC = () => {
  const { config, updateConfig } = useCompany();
  const { confirm } = useModal();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<IntegrationProfile | undefined>(undefined);
  const [showHelp, setShowHelp] = useState(false);

  const profiles = config.integrationProfiles || [];

  const handleSaveProfile = (profile: IntegrationProfile) => {
      const exists = profiles.some(p => p.id === profile.id);
      let newProfiles = [];
      if (exists) {
          newProfiles = profiles.map(p => p.id === profile.id ? profile : p);
      } else {
          newProfiles = [...profiles, profile];
      }
      updateConfig({ integrationProfiles: newProfiles });
  };

  const handleDelete = async (id: string) => {
      if (await confirm({ title: 'حذف الاتصال', message: 'هل أنت متأكد؟', variant: 'danger' })) {
          updateConfig({ integrationProfiles: profiles.filter(p => p.id !== id) });
      }
  };

  const openAdd = () => {
      setEditingProfile(undefined);
      setIsEditorOpen(true);
  };

  const openEdit = (profile: IntegrationProfile) => {
      setEditingProfile(profile);
      setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col pb-10">
        <SettingsSectionHeader 
            title="مزامنة القوائم التعريفية (Master Data Sync)"
            description="الربط مع الأنظمة الخارجية لتحديث القوائم الهيكلية (مثل قوائم الموظفين، تصنيفات العناصر، أو الهيكل الإداري) تلقائياً."
            icon={Wifi}
            bgClass="bg-purple-500/20"
            iconColorClass="text-purple-400"
            action={<Button onClick={openAdd} icon={<Plus size={16} />}>اتصال جديد</Button>}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {profiles.length === 0 ? (
                <EmptyState 
                    icon={Wifi}
                    title="لا توجد اتصالات"
                    description="لم تقم بتعريف أي اتصالات API لتحديث القوائم بعد."
                    action={{
                        label: 'إضافة اتصال جديد',
                        onClick: openAdd,
                        icon: <Plus size={16} />
                    }}
                    className="text-txt-muted"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profiles.map(profile => (
                        <div key={profile.id} className="glass-card p-5 transition-all group relative hover:border-purple-500/50 bg-surface-card border border-border-subtle">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center font-bold text-xs border border-purple-500/30">
                                        API
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-txt-main">{profile.name}</h4>
                                        <span className="text-[10px] bg-surface-input px-2 py-0.5 rounded text-txt-secondary font-mono border border-border-subtle">
                                            يحدث قائمة: {profile.targetEntity}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(profile)} className="p-1.5 text-txt-muted hover:text-blue-400 hover:bg-surface-input rounded">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(profile.id)} className="p-1.5 text-txt-muted hover:text-red-400 hover:bg-surface-input rounded">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-xs text-txt-secondary bg-black/20 p-2 rounded-lg font-mono truncate mb-3 border border-border-subtle" dir="ltr">
                                {profile.apiConfig.endpointUrl}
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-txt-muted border-t border-border-subtle pt-3">
                                <div className="flex items-center gap-1">
                                    {profile.lastSyncAt ? (
                                        <>
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                            <span>تم التحديث: {new Date(profile.lastSyncAt).toLocaleDateString('en-GB')}</span>
                                            {profile.lastSyncCount !== undefined && <span>({profile.lastSyncCount} عنصر)</span>}
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={12} />
                                            <span>لم تتم المزامنة بعد</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <SettingHelpBlock 
            title="الفرق بين مزامنة القوائم ومزامنة الحركات"
            description="هذا القسم مخصص لاستيراد 'التعريفات الهيكلية' فقط. لربط 'سجلات النشاط' أو 'البيانات الرقمية اليومية'، يرجى استخدام قسم 'مصادر وحاويات البيانات' في القائمة الجانبية."
            onClick={() => setShowHelp(true)}
            color="purple"
        />

        {isEditorOpen && (
            <ProfileEditorModal 
                isOpen={isEditorOpen} 
                onClose={() => setIsEditorOpen(false)} 
                onSave={handleSaveProfile}
                initialProfile={editingProfile}
            />
        )}

        <GenericGuideModal title="مزامنة القوائم الهيكلية" isOpen={showHelp} onClose={() => setShowHelp(false)}>
            <section>
                <h3 className="text-lg font-bold text-txt-main mb-2">متى أستخدم هذا القسم؟</h3>
                <p className="text-sm text-txt-secondary leading-relaxed">
                    إذا كان لديك نظام خارجي يحتوي على قائمة الموظفين أو الهيكل التنظيمي، وتريد أن يتم تحديث هذه القوائم في محرك الذكاء التنفيذي تلقائياً، قم بإنشاء ملف اتصال هنا.
                </p>
            </section>
        </GenericGuideModal>
    </div>
  );
};
