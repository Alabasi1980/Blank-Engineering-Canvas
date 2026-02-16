
import React, { useState, useMemo } from 'react';
import { X, Save, Globe } from 'lucide-react';
import { IntegrationProfile, ApiConfig, MasterEntityType } from '../../../../types';
import { StepApiConnection } from '../import/wizard/StepApiConnection';
import { Button } from '../../../../shared/components/Button';
import { useCompany } from '../../../../context/CompanyContext';

interface ProfileEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (profile: IntegrationProfile) => void;
    initialProfile?: IntegrationProfile;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({ isOpen, onClose, onSave, initialProfile }) => {
    const { config } = useCompany();
    const [step, setStep] = useState<'config' | 'mapping'>('config');
    const [name, setName] = useState(initialProfile?.name || '');
    
    // Dynamic Entity Selection derived from Config
    const ENTITY_OPTIONS = useMemo(() => {
        return (config.masterEntities || []).map(entity => ({
            value: entity.id as MasterEntityType,
            label: entity.label,
            // Dynamically combine required fields: ID, Name, ParentID + any user-defined required fields
            requiredFields: ['id', 'name', 'parentId', ...(entity.fields || []).filter(f => f.required).map(f => f.key)]
        }));
    }, [config.masterEntities]);

    const [entity, setEntity] = useState<string>(initialProfile?.targetEntity || (ENTITY_OPTIONS[0]?.value || ''));
    const [apiConfig, setApiConfig] = useState<ApiConfig | undefined>(initialProfile?.apiConfig);
    
    // Mapping state
    const [sourceColumns, setSourceColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>(initialProfile?.fieldMapping || {});

    if (!isOpen) return null;

    const handleApiSuccess = (data: any[], config: ApiConfig) => {
        setApiConfig(config);
        if (data.length > 0) {
            setSourceColumns(Object.keys(data[0]));
            // Auto map if editing is new or fields match
            if (Object.keys(mapping).length === 0) {
                const autoMap: Record<string, string> = {};
                const cols = Object.keys(data[0]);
                const required = ENTITY_OPTIONS.find(e => e.value === entity)?.requiredFields || [];
                
                required.forEach(req => {
                    const match = cols.find(c => c.toLowerCase().includes(req.toLowerCase()) || 
                       (req === 'id' && (c.toLowerCase().includes('code') || c.includes('رمز'))) ||
                       (req === 'name' && (c.includes('اسم') || c.includes('title')))
                    );
                    if (match) autoMap[req] = match;
                });
                setMapping(autoMap);
            }
            setStep('mapping');
        } else {
            alert("لم يتم العثور على بيانات في الاستجابة");
        }
    };

    const handleSaveProfile = () => {
        if (!name || !apiConfig) return;
        const profile: IntegrationProfile = {
            id: initialProfile?.id || crypto.randomUUID(),
            name,
            targetEntity: entity,
            apiConfig,
            fieldMapping: mapping
        };
        onSave(profile);
        onClose();
    };

    const targetFields = ENTITY_OPTIONS.find(e => e.value === entity)?.requiredFields || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] bg-surface-card border border-border-subtle shadow-2xl">
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-overlay">
                    <h3 className="font-bold text-txt-main flex items-center gap-2">
                        <Globe size={18} className="text-purple-400"/>
                        {initialProfile ? 'تعديل اتصال' : 'اتصال جديد'}
                    </h3>
                    <button onClick={onClose}><X size={18} className="text-txt-muted hover:text-red-400"/></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {step === 'config' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-txt-secondary mb-1">اسم الاتصال</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="مثال: رابط البيانات الرئيسي"
                                        className="input-fantasy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-txt-secondary mb-1">نوع البيانات (Target)</label>
                                    <select 
                                        value={entity} 
                                        onChange={e => setEntity(e.target.value)} 
                                        className="input-fantasy cursor-pointer"
                                        disabled={!!initialProfile} // Prevent changing type on edit to avoid mapping chaos
                                    >
                                        {ENTITY_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <StepApiConnection 
                                initialConfig={apiConfig}
                                onSuccess={handleApiSuccess}
                                onCancel={onClose}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-sm text-purple-300 mb-4">
                                قم بربط حقول النظام (يمين) بالأعمدة القادمة من الـ API (يسار).
                            </div>
                            
                            <div className="space-y-3">
                                {targetFields.map(field => (
                                    <div key={field} className="flex items-center justify-between py-2 border-b border-border-subtle">
                                        <div className="w-1/3 font-bold text-txt-secondary text-sm">
                                            {field === 'id' ? 'الرمز / المعرف (ID)' : 
                                             field === 'name' ? 'الاسم (Name)' : 
                                             field === 'parentId' ? 'المجموعة (Group ID)' : 
                                             field}
                                            <span className="text-red-400 ml-1">*</span>
                                        </div>
                                        <div className="w-2/3">
                                            <select 
                                                value={mapping[field] || ''}
                                                onChange={e => setMapping({...mapping, [field]: e.target.value})}
                                                className="input-fantasy cursor-pointer"
                                            >
                                                <option value="">-- اختر من المصدر --</option>
                                                {sourceColumns.map(col => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-surface-overlay border-t border-border-subtle flex justify-end gap-2">
                    {step === 'mapping' && (
                        <Button variant="secondary" onClick={() => setStep('config')} size="sm">رجوع</Button>
                    )}
                    {step === 'mapping' && (
                        <Button onClick={handleSaveProfile} disabled={!name} size="sm" icon={<Save size={16} />}>
                            حفظ الاتصال
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
