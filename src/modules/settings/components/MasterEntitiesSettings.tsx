
import React, { useState, useEffect } from 'react';
import { 
    Plus, Trash2, Edit2, ListTree, List as ListIcon, 
    Box, X, LayoutGrid, Settings2, Tag, Key, GitMerge
} from 'lucide-react';
import { useCompany } from '../../../context/CompanyContext';
import { MasterEntityDefinition, MasterEntityField } from '../../../types';
import { Button } from '../../../shared/components/Button';
import { ColorPicker } from '../../../shared/components/ColorPicker'; 
import { IconPicker } from '../../../shared/components/IconPicker';   
import { useModal } from '../../../context/ModalContext';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';
import { CARD_COLORS, MASTER_ICONS } from '../../../constants';
import { SettingHelpBlock } from './system/SettingHelpBlock';
import { GenericGuideModal } from './system/GenericGuideModal';

const EntityEditorModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
    const [label, setLabel] = useState(initialData?.label || '');
    const [customId, setCustomId] = useState(initialData?.id || '');
    const [isTree, setIsTree] = useState(initialData?.hierarchy?.enabled || false);
    const [icon, setIcon] = useState(initialData?.icon || 'Box');
    const [color, setColor] = useState(initialData?.color || 'blue');
    const [description, setDescription] = useState(initialData?.description || '');
    const [isSystem, setIsSystem] = useState(initialData?.isSystem || false);
    const [fields, setFields] = useState<MasterEntityField[]>(initialData?.fields || []);
    
    // Semantic Labels
    const [keyFieldLabel, setKeyFieldLabel] = useState(initialData?.keyFieldLabel || 'الرمز / المعرف');
    const [labelFieldLabel, setLabelFieldLabel] = useState(initialData?.labelFieldLabel || 'الاسم / الوصف');

    useEffect(() => {
        if (isOpen) {
            setLabel(initialData?.label || '');
            setCustomId(initialData?.id || '');
            setIsTree(initialData?.hierarchy?.enabled || initialData?.isTree || false);
            setIcon(initialData?.icon || 'Box');
            setColor(initialData?.color || 'blue');
            setDescription(initialData?.description || '');
            setIsSystem(initialData?.isSystem || false);
            setFields(initialData?.fields || []);
            setKeyFieldLabel(initialData?.keyFieldLabel || 'الرمز / المعرف');
            setLabelFieldLabel(initialData?.labelFieldLabel || 'الاسم / الوصف');
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!label.trim()) return;
        let finalId = customId.trim() || `ent_${crypto.randomUUID().slice(0, 8)}`;
        onSave({ 
            id: finalId, 
            label, 
            hierarchy: {
                enabled: isTree,
                parentKey: 'parentId', 
                separator: ' / '
            },
            icon, 
            color, 
            description, 
            isSystem, 
            fields,
            keyFieldLabel,   
            labelFieldLabel
        });
        onClose();
    };

    const SelectedIcon = MASTER_ICONS[icon] || Box;
    const selectedColorTheme = CARD_COLORS.find(c => c.value === color) || CARD_COLORS[0];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-2xl overflow-hidden border border-border-subtle flex flex-col max-h-[90vh] bg-surface-card shadow-2xl">
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-overlay">
                    <h3 className="font-bold text-txt-main text-lg flex items-center gap-2">
                        {initialData ? <Edit2 size={18} className="text-primary-400"/> : <Plus size={18} className="text-primary-400"/>}
                        {initialData ? 'تعديل تعريف الكيان' : 'تعريف كيان جديد'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-txt-muted hover:text-white"><X size={20}/></button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-full p-6 overflow-y-auto custom-scrollbar space-y-6">
                        {/* Live Preview Header */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-surface-input border-border-subtle">
                           <SelectedIcon size={24} className={selectedColorTheme.text} />
                           <div className="flex flex-col flex-1">
                               <span className="text-sm font-bold text-txt-main">{label || 'اسم الكيان...'}</span>
                               <span className="text-[10px] text-txt-muted">({isTree ? 'هرمي (شجرة)' : 'قائمة مسطحة'})</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-txt-secondary mb-1.5">اسم الكيان (Entity Name) <span className="text-red-400">*</span></label>
                                <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="input-fantasy w-full" placeholder="مثال: الموظفين، الآليات..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-txt-secondary mb-1.5">الرمز البرمجي (Internal ID)</label>
                                <input type="text" value={customId} onChange={e => setCustomId(e.target.value)} disabled={!!initialData} className="input-fantasy w-full font-mono bg-surface-input opacity-70" placeholder="auto-generated" />
                            </div>
                        </div>

                        {/* Semantic Labels */}
                        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 space-y-3">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <Settings2 size={12} /> تخصيص دلالات الحقول (Semantics)
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-300 mb-1 flex items-center gap-1"><Key size={10}/> مسمى حقل المعرف (ID)</label>
                                    <input 
                                        type="text" 
                                        value={keyFieldLabel} 
                                        onChange={e => setKeyFieldLabel(e.target.value)} 
                                        className="w-full p-2 border border-blue-500/30 rounded-lg text-xs bg-surface-card focus:border-blue-400 outline-none text-txt-main" 
                                        placeholder="مثال: رقم الهوية، كود المشروع"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-300 mb-1 flex items-center gap-1"><Tag size={10}/> مسمى حقل الاسم (Name)</label>
                                    <input 
                                        type="text" 
                                        value={labelFieldLabel} 
                                        onChange={e => setLabelFieldLabel(e.target.value)} 
                                        className="w-full p-2 border border-blue-500/30 rounded-lg text-xs bg-surface-card focus:border-blue-400 outline-none text-txt-main" 
                                        placeholder="مثال: الاسم الكامل، وصف المشروع"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hierarchy Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="block text-xs font-bold text-txt-secondary mb-2">نوع الهيكل والعلاقات</label>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => setIsTree(false)} 
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${!isTree ? 'bg-surface-card border-blue-500 shadow-md ring-1 ring-blue-500/30' : 'bg-surface-input border-border-subtle text-txt-muted hover:bg-surface-overlay'}`}
                                    >
                                        <ListIcon size={18} className={!isTree ? 'text-blue-400' : 'text-txt-muted'} />
                                        <div>
                                            <div className={`text-xs font-bold ${!isTree ? 'text-blue-300' : 'text-txt-secondary'}`}>قائمة بسيطة</div>
                                            <div className="text-[9px] opacity-60">عناصر مستقلة (سائقين، عملاء)</div>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setIsTree(true)} 
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${isTree ? 'bg-surface-card border-purple-500 shadow-md ring-1 ring-purple-500/30' : 'bg-surface-input border-border-subtle text-txt-muted hover:bg-surface-overlay'}`}
                                    >
                                        <GitMerge size={18} className={isTree ? 'text-purple-400' : 'text-txt-muted'} />
                                        <div>
                                            <div className={`text-xs font-bold ${isTree ? 'text-purple-300' : 'text-txt-secondary'}`}>هيكلية شجرية</div>
                                            <div className="text-[9px] opacity-60">تفرعات وأبناء (حسابات، مواقع)</div>
                                        </div>
                                    </button>
                                </div>
                           </div>
                           <div><IconPicker selectedIcon={icon} onChange={setIcon} label="الأيقونة" /></div>
                        </div>
                        <div><ColorPicker selectedColor={color} onChange={setColor} label="لون التمييز" /></div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-surface-overlay border-t border-border-subtle flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>إلغاء</Button>
                    <Button onClick={handleSave}>حفظ تعريف الكيان</Button>
                </div>
            </div>
        </div>
    );
};

export const MasterEntitiesSettings: React.FC = () => {
    const { config, updateConfig } = useCompany();
    const { confirm } = useModal();
    const entities = config.masterEntities || [];
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<MasterEntityDefinition | undefined>(undefined);

    const handleOpenAdd = () => { setEditingEntity(undefined); setIsModalOpen(true); };
    const handleOpenEdit = (entity: MasterEntityDefinition) => { setEditingEntity(entity); setIsModalOpen(true); };

    const handleSaveEntity = (entity: MasterEntityDefinition) => {
        const exists = entities.some(e => e.id === entity.id);
        const currentDims = config.dimensionsRegistry || [];
        const existingDimIndex = currentDims.findIndex(d => d.id === entity.id);
        let newDims = [...currentDims];

        if (existingDimIndex >= 0) {
            newDims[existingDimIndex] = { ...newDims[existingDimIndex], label: entity.label };
        } else {
            newDims.push({
                id: entity.id, label: entity.label, type: 'master_data', sourceEntityId: entity.id,
                enabled: true, ui: { filter: true, rule: true, pivot: true, import: true },
                importAliases: [entity.label, entity.id],
                role: 'none'
            });
        }

        updateConfig({ 
            masterEntities: exists ? entities.map(e => e.id === entity.id ? entity : e) : [...entities, entity],
            dimensionsRegistry: newDims 
        });
    };

    const handleDelete = async (id: string) => {
        if (await confirm({ title: 'حذف تعريف القائمة', message: 'سيتم حذف القائمة وبياناتها نهائياً. هل أنت متأكد؟', variant: 'danger' })) {
            updateConfig({ 
                masterEntities: entities.filter(e => e.id !== id),
                dimensionsRegistry: (config.dimensionsRegistry || []).filter(d => d.id !== id)
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10 flex flex-col h-full">
            <SettingsSectionHeader 
                title="هيكلية النظام والقوائم المرجعية (Entity Builder)"
                description="قم ببناء الكيانات التي يتكون منها عملك (مثل: الموظفين، المشاريع، السيارات). النظام سيتعامل مع كل كيان بناءً على خصائصه."
                icon={LayoutGrid}
                bgClass="bg-indigo-500/10"
                iconColorClass="text-indigo-400"
                action={<Button onClick={handleOpenAdd} size="sm" icon={<Plus size={16} />}>إضافة كيان جديد</Button>}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 content-start">
                {entities.map(entity => {
                    const colorTheme = CARD_COLORS.find(c => c.value === entity.color) || CARD_COLORS[0];
                    const IconComp = MASTER_ICONS[entity.icon || 'Box'] || Box;
                    const isTree = entity.hierarchy?.enabled || entity.isTree;

                    return (
                        <div key={entity.id} className="glass-card p-5 rounded-2xl border border-border-subtle hover:border-blue-500/30 hover:shadow-md shadow-sm transition-all group relative overflow-hidden flex flex-col bg-surface-card">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorTheme.iconBg.replace('bg-', 'bg-opacity-20 bg-')} ${colorTheme.text}`}>
                                        <IconComp size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-txt-main text-base">{entity.label}</h4>
                                        <span className="text-[10px] font-mono bg-surface-input text-txt-muted px-1.5 rounded">{entity.id}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleOpenEdit(entity)} className="p-2 text-txt-muted hover:text-blue-400 hover:bg-surface-input rounded-lg transition-all"><Edit2 size={14} /></button>
                                    {!entity.isSystem && <button onClick={() => handleDelete(entity.id)} className="p-2 text-txt-muted hover:text-red-400 hover:bg-surface-input rounded-lg transition-all"><Trash2 size={14} /></button>}
                                </div>
                            </div>
                            <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className="text-[9px] px-2 py-1 rounded bg-surface-input text-txt-muted border border-border-subtle">
                                        ID: {entity.keyFieldLabel || 'الرمز'}
                                    </span>
                                    <span className="text-[9px] px-2 py-1 rounded bg-surface-input text-txt-muted border border-border-subtle">
                                        Name: {entity.labelFieldLabel || 'الاسم'}
                                    </span>
                                </div>
                                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 ${isTree ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                    {isTree ? <GitMerge size={12} /> : <ListIcon size={12} />}
                                    {isTree ? 'شجرة (Tree)' : 'قائمة (List)'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="shrink-0">
                <SettingHelpBlock 
                    title="دليل بناء الهيكلية الذكي"
                    description="تعلم كيفية بناء شجرة البيانات، الفرق بين القوائم، وكيفية ربطها بالتقارير."
                    onClick={() => setIsHelpOpen(true)}
                    color="indigo"
                />
            </div>

            <EntityEditorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEntity} initialData={editingEntity} />
            
            <GenericGuideModal title="كيف تبني هيكلية بياناتك بذكاء؟" isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)}>
                <section>
                    <h3 className="text-lg font-bold text-txt-main mb-2">1. القوائم المرجعية (Master Data)</h3>
                    <p className="text-sm text-txt-secondary leading-relaxed">
                        هي قوائم البيانات الثابتة التي تستخدمها لتصنيف حركاتك اليومية. تضمن توحيد المسميات وتمكنك من فلترة التقارير بدقة عالية.
                    </p>
                </section>
                <section>
                    <h3 className="text-lg font-bold text-txt-main mb-2">2. أي هيكلية أختار؟</h3>
                    <ul className="list-disc list-inside text-sm text-txt-secondary leading-relaxed space-y-1">
                        <li><strong>القائمة البسيطة:</strong> للعناصر المستقلة مثل السائقين أو أنواع السيارات.</li>
                        <li><strong>القائمة الشجرية:</strong> للعناصر المتفرعة مثل شجرة الحسابات أو الهيكل الإداري.</li>
                    </ul>
                </section>
            </GenericGuideModal>
        </div>
    );
};
