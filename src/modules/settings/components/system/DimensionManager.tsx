
import React, { useState } from 'react';
import { 
    Edit2, Eye, EyeOff, Filter, Calculator, 
    Table, UploadCloud, Save, Plus, Trash2, Layers
} from 'lucide-react';
import { useCompany } from '../../../../context/CompanyContext';
import { DimensionDefinition, DimensionType, SchemaField } from '../../../../types';
import { Button } from '../../../../shared/components/Button';
import { SettingsSectionHeader } from './SettingsSectionHeader';
import { useModal } from '../../../../context/ModalContext';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { SettingHelpBlock } from './SettingHelpBlock';

const DIMENSION_TYPES: { value: DimensionType; label: string }[] = [
    { value: 'master_data', label: 'قائمة مرجعية (Master Data)' },
    { value: 'text', label: 'نص حر (Text)' },
    { value: 'number', label: 'رقم (Number)' },
    { value: 'date', label: 'تاريخ (Date)' },
];

export const DimensionManager: React.FC = () => {
    const { config, updateConfig } = useCompany();
    const { confirm } = useModal();
    const dimensions = config.dimensionsRegistry || [];
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempAliases, setTempAliases] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleDeleteDimension = async (id: string, label: string) => {
        if (await confirm({ title: 'حذف البُعد', message: `هل أنت متأكد من حذف البُعد "${label}"؟`, variant: 'danger' })) {
            const newDims = dimensions.filter(d => d.id !== id);
            const newSchemaFields = (config.schema.fields || []).filter(f => f.id !== id);
            updateConfig({ dimensionsRegistry: newDims, schema: { ...config.schema, fields: newSchemaFields } });
        }
    };

    const handleToggleEnabled = (id: string, currentStatus: boolean) => {
        updateConfig({ dimensionsRegistry: dimensions.map(d => d.id === id ? { ...d, enabled: !currentStatus } : d) });
    };

    const handleUpdate = (id: string, updates: Partial<DimensionDefinition>) => {
        updateConfig({ dimensionsRegistry: dimensions.map(d => d.id === id ? { ...d, ...updates } : d) });
    };

    const handleUpdateUI = (id: string, uiKey: keyof DimensionDefinition['ui']) => {
        const dim = dimensions.find(d => d.id === id);
        if (!dim) return;
        handleUpdate(id, { ui: { ...dim.ui, [uiKey]: !dim.ui[uiKey] } });
    };

    const saveAliases = (id: string) => {
        const aliases = tempAliases.split(',').map(s => s.trim()).filter(Boolean);
        handleUpdate(id, { importAliases: aliases });
        setEditingId(null);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col overflow-hidden">
            <SettingsSectionHeader 
                title="سجل أبعاد النظام (Dimension Registry)"
                description="مركز التحكم بمرونة البيانات. قم بتعريف الحقول التي تريد تتبعها في نظامك وربطها بالكيانات المرجعية."
                icon={Layers}
                bgClass="bg-purple-500/10"
                iconColorClass="text-purple-400"
                action={<Button onClick={() => setIsAddModalOpen(true)} size="sm" icon={<Plus size={16} />}>إضافة بُعد جديد</Button>}
            />

            <div className="card-fantasy overflow-hidden flex flex-col flex-1 relative bg-surface-card border-border-subtle">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {dimensions.length === 0 ? (
                        <EmptyState 
                            icon={Layers} title="سجل الأبعاد فارغ" 
                            description="ابدأ بتعريف الحقول التي تهمك في عملك لتظهر في كافة أنحاء النظام."
                            action={{ label: 'إضافة أول بُعد الآن', onClick: () => setIsAddModalOpen(true), icon: <Plus size={16} /> }}
                            className="text-txt-muted"
                        />
                    ) : (
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-surface-overlay text-txt-muted text-[10px] font-black uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 w-16 text-center border-b border-border-subtle">الحالة</th>
                                    <th className="px-6 py-4 w-[30%] border-b border-border-subtle">اسم البُعد والتعريف</th>
                                    <th className="px-6 py-4 w-[15%] border-b border-border-subtle text-center">النوع</th>
                                    <th className="px-6 py-4 w-[20%] border-b border-border-subtle text-center">الظهور في الواجهات</th>
                                    <th className="px-6 py-4 border-b border-border-subtle">كلمات الربط (Aliases)</th>
                                    <th className="px-4 py-4 w-12 border-b border-border-subtle"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle text-txt-main">
                                {dimensions.map(dim => (
                                    <tr key={dim.id} className={`group hover:bg-surface-overlay transition-colors ${!dim.enabled ? 'opacity-50 grayscale' : ''}`}>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => handleToggleEnabled(dim.id, dim.enabled)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${dim.enabled ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-surface-input text-txt-muted shadow-inner'}`}>
                                                {dim.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 group/title">
                                                    <input type="text" value={dim.label} onChange={e => handleUpdate(dim.id, { label: e.target.value })} className="font-black text-sm bg-transparent border-b border-transparent hover:border-purple-500 focus:border-purple-500 outline-none transition-all px-1 py-1 rounded w-full text-txt-main" />
                                                    <Edit2 size={12} className="text-txt-muted opacity-0 group-hover/title:opacity-100 shrink-0" />
                                                </div>
                                                <code className="text-[9px] font-mono text-txt-muted">ID: {dim.id}</code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-txt-secondary bg-surface-input px-2.5 py-1 rounded-full border border-border-subtle">
                                                    {DIMENSION_TYPES.find(t => t.value === dim.type)?.label.split(' ')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2 bg-surface-input p-1.5 rounded-2xl border border-border-subtle shadow-inner max-w-[160px] mx-auto">
                                                <VisibilityToggle active={dim.ui.filter} onClick={() => handleUpdateUI(dim.id, 'filter')} icon={Filter} label="الفلاتر" disabled={!dim.enabled} />
                                                <VisibilityToggle active={dim.ui.rule} onClick={() => handleUpdateUI(dim.id, 'rule')} icon={Calculator} label="القواعد" disabled={!dim.enabled} />
                                                <VisibilityToggle active={dim.ui.pivot} onClick={() => handleUpdateUI(dim.id, 'pivot')} icon={Table} label="التقارير" disabled={!dim.enabled} />
                                                <VisibilityToggle active={dim.ui.import} onClick={() => handleUpdateUI(dim.id, 'import')} icon={UploadCloud} label="الاستيراد" disabled={!dim.enabled} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {editingId === dim.id ? (
                                                <div className="flex gap-1">
                                                    <input value={tempAliases} onChange={e => setTempAliases(e.target.value)} className="input-fantasy w-full text-xs font-bold p-2" autoFocus onKeyDown={e => e.key === 'Enter' && saveAliases(dim.id)} />
                                                    <button onClick={() => saveAliases(dim.id)} className="bg-purple-600 text-white p-2 rounded-xl"><Save size={16} /></button>
                                                </div>
                                            ) : (
                                                <div onClick={() => dim.enabled && setEditingId(dim.id)} className="text-xs cursor-pointer hover:bg-surface-overlay p-2 rounded-xl border border-transparent hover:border-purple-500/30 transition-all flex flex-wrap gap-1.5 min-h-[40px]">
                                                    {dim.importAliases?.map(alias => <span key={alias} className="bg-purple-500/10 text-purple-300 px-2 py-1 rounded-lg text-[10px] font-black border border-purple-500/20">{alias}</span>)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-5 text-center">
                                            {!dim.isSystem && <button onClick={() => handleDeleteDimension(dim.id, dim.label)} className="p-2 text-txt-muted hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <SettingHelpBlock 
                title="تجريد البيانات"
                description="النظام لا يمتلك حقولاً مسبقة. أنت من يقرر ما هو المهم. كل بُعد تضيفه هنا يصبح محركاً للفلترة والتحليل."
                onClick={() => setShowHelp(true)}
                color="purple"
            />

            {/* Reuse the AddDimensionModal but make it glassy if we were updating it too, keeping simple for now */}
        </div>
    );
};

const VisibilityToggle = ({ active, onClick, icon: Icon, label, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} title={label} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${disabled ? 'opacity-30' : active ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-txt-muted hover:text-txt-main'}`}>
        <Icon size={14} strokeWidth={active ? 3 : 2} />
    </button>
);
