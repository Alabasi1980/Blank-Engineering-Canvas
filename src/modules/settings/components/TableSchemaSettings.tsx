
import React, { useMemo, useState } from 'react';
import { Table, Plus, Trash2, Tag, Settings2, CheckCircle2, Box, Edit2, Maximize2, Calendar, AlignLeft, FileText, DollarSign, List, Hash, Database } from 'lucide-react';
import { useCompany } from '../../../context/CompanyContext';
import { TableSchema, TableColumnSettings } from '../../../types';
import { Button } from '../../../shared/components/Button';
import { useModal } from '../../../context/ModalContext';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';
import { SchemaColumnRow } from './schema/SchemaColumnRow';
import { useLabelResolver } from '../../../hooks/useLabelResolver';
import { SimpleInputModal } from '../../../shared/components/SimpleInputModal';
import { SettingHelpBlock } from './system/SettingHelpBlock';
import { GenericGuideModal } from './system/GenericGuideModal';
import { MASTER_ICONS, CARD_COLORS } from '../../../constants';

interface RoleDefinition {
    id: string;
    label: string;
    description: string;
    required: boolean;
    unique: boolean;
    icon: React.ElementType;
    color: string;
}

export const TableSchemaSettings: React.FC = () => {
    const { config, updateConfig } = useCompany();
    const { confirm } = useModal();
    const { getSystemLabel } = useLabelResolver();
    
    const schemas = config.tableSchemas || [];
    const [activeSchemaId, setActiveSchemaId] = useState<string | null>(schemas[0]?.id || null);
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const activeSchema = schemas.find(s => s.id === activeSchemaId);

    // Build roles dynamically from Registry AND Custom Attributes
    const AVAILABLE_ROLES = useMemo((): RoleDefinition[] => {
        const roles: RoleDefinition[] = [];
        const addedIds = new Set<string>();
        
        // 1. Dimensions Registry (Core + Master Data)
        (config.dimensionsRegistry || []).forEach(dim => {
            let icon = Tag;
            let color = 'text-txt-muted';
            
            // Core System Fields logic (Engine Constants)
            if (dim.type === 'date' || dim.id === 'date') { icon = Calendar; }
            else if (dim.id === 'amount') { icon = DollarSign; } 
            else if (dim.id === 'description') { icon = AlignLeft; }
            else if (dim.id === 'sourceRef') { icon = FileText; }
            else if (dim.type === 'master_data') {
                // Dynamic Master Data Logic
                icon = Database;
                color = 'text-purple-400';
                
                // Try to find specific styling from MasterEntity definition
                const entityDef = config.masterEntities?.find(e => e.id === (dim.sourceEntityId || dim.id));
                if (entityDef) {
                    if (entityDef.icon && MASTER_ICONS[entityDef.icon]) {
                        icon = MASTER_ICONS[entityDef.icon];
                    }
                    if (entityDef.color) {
                        const theme = CARD_COLORS.find(c => c.value === entityDef.color);
                        if (theme) color = theme.text; // e.g. text-blue-600 -> we might need to adjust for dark mode
                    }
                }
            }
            else if (dim.type === 'list') { icon = List; }
            else if (dim.type === 'number') { icon = Hash; }

            roles.push({
                id: dim.id,
                label: dim.label,
                description: dim.isSystem ? 'حقل نظام أساسي' : (dim.type === 'master_data' ? 'قائمة مرجعية' : 'حقل بيانات'),
                required: false, 
                unique: false,
                icon,
                color
            });
            addedIds.add(dim.id);
        });

        // 2. Custom Attributes (Merge them in)
        (config.customAttributes || []).forEach(attr => {
            if (addedIds.has(attr.id)) return;

            roles.push({
                id: attr.id,
                label: attr.label,
                description: 'سمة مخصصة (Custom Attribute)',
                required: false,
                unique: false,
                icon: Hash,
                color: 'text-amber-400'
            });
            addedIds.add(attr.id);
        });

        return roles;
    }, [config.dimensionsRegistry, config.customAttributes, config.masterEntities]);

    const currentColumns = useMemo(() => {
        if (!activeSchema) return [];
        const settings = activeSchema.columnSettings || (activeSchema.visibleColumns ? activeSchema.visibleColumns.map(id => ({ id, required: false })) : []);
        
        return settings.map(col => {
            const roleDef = AVAILABLE_ROLES.find(r => r.id === col.id);
            let label = col.labelOverride;
            if (!label) {
                label = roleDef ? roleDef.label : getSystemLabel(col.id);
            }

            return {
                uniqueId: crypto.randomUUID(),
                id: col.id,
                label,
                role: col.id,
                required: col.required,
                width: col.width || 120
            };
        });
    }, [activeSchema, AVAILABLE_ROLES, getSystemLabel]);

    const handleUpdateColumn = (index: number, updates: any) => {
        if (!activeSchema) return;
        const newCols = [...currentColumns];
        const updatedCol = { ...newCols[index], ...updates };
        
        if (updates.role) {
            updatedCol.id = updates.role; 
            const roleDef = AVAILABLE_ROLES.find(r => r.id === updates.role);
            if(roleDef) updatedCol.label = roleDef.label;
        }
        newCols[index] = updatedCol;
        saveColumns(newCols);
    };

    const handleAddColumn = () => {
        if (!activeSchema) return;
        
        const defaultRole = AVAILABLE_ROLES[0];
        if (!defaultRole) {
            alert("لا توجد أبعاد بيانات معرفة في النظام.");
            return;
        }

        const newCols = [...currentColumns, {
            uniqueId: crypto.randomUUID(),
            id: defaultRole.id,
            label: defaultRole.label,
            role: defaultRole.id,
            required: false,
            width: 120
        }];
        saveColumns(newCols);
    };

    const handleDeleteColumn = (index: number) => {
        if (!activeSchema) return;
        const newCols = currentColumns.filter((_, i) => i !== index);
        saveColumns(newCols);
    };

    const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
        if (!activeSchema) return;
        const newCols = [...currentColumns];
        if (direction === 'up' && index > 0) {
            [newCols[index], newCols[index - 1]] = [newCols[index - 1], newCols[index]];
        } else if (direction === 'down' && index < newCols.length - 1) {
            [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]];
        }
        saveColumns(newCols);
    };

    const saveColumns = (cols: typeof currentColumns) => {
        if (!activeSchemaId) return;
        const columnSettings: TableColumnSettings[] = cols.map(c => ({
            id: c.id,
            labelOverride: c.label,
            required: c.required,
            width: c.width
        }));
        const updatedSchemas = schemas.map(s => {
            if (s.id !== activeSchemaId) return s;
            return { ...s, columnSettings, visibleColumns: columnSettings.map(c => c.id) };
        });
        updateConfig({ tableSchemas: updatedSchemas });
    };

    const handleSaveNewSchema = (name: string) => {
        const defaultCols: TableColumnSettings[] = [];
        if (AVAILABLE_ROLES.length > 0) defaultCols.push({ id: AVAILABLE_ROLES[0].id, required: true, width: 120 });
        if (AVAILABLE_ROLES.length > 1) defaultCols.push({ id: AVAILABLE_ROLES[1].id, required: false, width: 200 });

        const newSchema: TableSchema = {
            id: `schema_${crypto.randomUUID().slice(0, 8)}`,
            name,
            visibleColumns: defaultCols.map(c => c.id), 
            columnSettings: defaultCols,
            isSystem: false
        };
        updateConfig({ tableSchemas: [...schemas, newSchema] });
        setActiveSchemaId(newSchema.id);
    };

    const handleRenameSchema = () => {
        if(editingNameId && tempName.trim()) {
            updateConfig({ tableSchemas: schemas.map(s => s.id === editingNameId ? { ...s, name: tempName } : s) });
        }
        setEditingNameId(null);
    };

    const handleDeleteSchema = async (id: string) => {
        if (await confirm({ title: 'حذف النموذج', message: 'هل أنت متأكد؟', variant: 'danger' })) {
            const newSchemas = schemas.filter(s => s.id !== id);
            updateConfig({ tableSchemas: newSchemas });
            if (activeSchemaId === id) setActiveSchemaId(newSchemas[0]?.id || null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
            <SettingsSectionHeader 
                title="مختبر تصميم النماذج (Schema Lab)"
                description="صمم القواعد والهياكل التي تتحكم في كيفية معالجة وعرض البيانات في التقارير."
                icon={Table}
                bgClass="bg-blue-500/10"
                iconColorClass="text-blue-400"
                action={<Button onClick={() => setIsAddModalOpen(true)} size="sm" icon={<Plus size={16} />}>نموذج جديد</Button>}
            />

            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] flex-1">
                {/* Sidebar */}
                <div className="w-full lg:w-72 glass-card rounded-[2rem] border border-border-subtle flex flex-col overflow-hidden shrink-0 shadow-sm bg-surface-card">
                    <div className="p-6 bg-surface-overlay border-b border-border-subtle font-black text-txt-muted text-[10px] uppercase tracking-widest">نماذج عرض البيانات</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {schemas.map(schema => (
                            <div 
                                key={schema.id} 
                                onClick={() => setActiveSchemaId(schema.id)}
                                className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                                    activeSchemaId === schema.id ? 'bg-primary-600 border-primary-500 shadow-lg shadow-primary-500/20' : 'bg-transparent border-transparent hover:bg-surface-overlay'
                                }`}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`p-2 rounded-xl ${activeSchemaId === schema.id ? 'bg-white/20 text-white' : (schema.isSystem ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-input text-txt-muted')}`}>
                                        <Table size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        {editingNameId === schema.id ? (
                                            <input 
                                                autoFocus value={tempName} onChange={e => setTempName(e.target.value)}
                                                onBlur={handleRenameSchema} onKeyDown={e => e.key === 'Enter' && handleRenameSchema()}
                                                onClick={e => e.stopPropagation()}
                                                className="w-full text-xs font-bold bg-surface-input border border-primary-500 rounded px-1 text-txt-main"
                                            />
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black truncate ${activeSchemaId === schema.id ? 'text-white' : 'text-txt-main'}`}>{schema.name}</span>
                                                <span className={`text-[10px] font-bold ${activeSchemaId === schema.id ? 'text-primary-200' : 'text-txt-muted'}`}>{schema.visibleColumns.length} أعمدة مفعلة</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                    {!schema.isSystem && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); setEditingNameId(schema.id); setTempName(schema.name); }} className={`p-1.5 rounded-lg ${activeSchemaId === schema.id ? 'text-white hover:bg-white/10' : 'text-txt-muted hover:bg-surface-input'}`}><Edit2 size={14}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSchema(schema.id); }} className={`p-1.5 rounded-lg ${activeSchemaId === schema.id ? 'text-white hover:bg-white/10' : 'text-txt-muted hover:bg-red-500/10 hover:text-red-400'}`}><Trash2 size={14}/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Designer */}
                <div className="flex-1 glass-card rounded-[2rem] border border-border-subtle flex flex-col overflow-hidden relative shadow-sm bg-surface-card">
                    {!activeSchema ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-txt-muted gap-4">
                            <Table size={64} className="opacity-10" />
                            <span className="font-black">اختر نموذجاً للبدء في التصميم</span>
                        </div>
                    ) : (
                        <>
                            <div className={`p-6 border-b border-border-subtle z-10 flex flex-col gap-4 bg-surface-overlay`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20"><Settings2 size={20} /></div>
                                        <span className="text-lg font-black text-txt-main">{activeSchema.name}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
                                        <CheckCircle2 size={16} />
                                        <span>التصميم جاهز</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-surface-app/50">
                                {currentColumns.map((col, idx) => (
                                    <SchemaColumnRow 
                                        key={col.uniqueId}
                                        col={col}
                                        index={idx}
                                        totalCount={currentColumns.length}
                                        roleDef={AVAILABLE_ROLES.find(r => r.id === col.role)}
                                        systemRoles={AVAILABLE_ROLES}
                                        customSources={[]} // Deprecated
                                        onUpdate={handleUpdateColumn}
                                        onDelete={handleDeleteColumn}
                                        onMove={handleMoveColumn}
                                    />
                                ))}
                                <button onClick={handleAddColumn} className="w-full py-5 border-2 border-dashed border-border-subtle rounded-[1.5rem] flex items-center justify-center gap-3 text-txt-muted hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group font-black text-sm">
                                    <Plus size={20} className="group-hover:scale-110 transition-transform" /> إضافة عمود جديد للنموذج
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <SettingHelpBlock 
                title="ما فائدة النماذج (Schemas)؟"
                description="تتيح لك النماذج تخصيص الأعمدة التي تظهر في جداول التفاصيل. بدلاً من عرض كافة الأعمدة لكل المستخدمين، يمكنك إنشاء نماذج مخصصة تعرض فقط المعلومات ذات الصلة."
                onClick={() => setShowHelp(true)}
                color="indigo"
            />

            <SimpleInputModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveNewSchema}
                title="إنشاء نموذج جدول جديد"
                label="اسم النموذج"
                placeholder="مثال: نموذج التفاصيل..."
                confirmText="إنشاء النموذج"
            />

            <GenericGuideModal title="تصميم نماذج العرض" isOpen={showHelp} onClose={() => setShowHelp(false)}>
                <section>
                    <h3 className="text-lg font-bold text-txt-main mb-2">1. تخصيص الأعمدة</h3>
                    <p className="text-sm text-txt-secondary leading-relaxed">
                        اختر الحقول التي تهمك من القائمة. يمكنك إعادة تسمية العمود ليظهر في التقرير بشكل أوضح للمستخدم النهائي.
                    </p>
                </section>
                <section>
                    <h3 className="text-lg font-bold text-txt-main mb-2">2. الترتيب والعرض</h3>
                    <p className="text-sm text-txt-secondary leading-relaxed">
                        استخدم الأسهم لترتيب الأعمدة حسب الأهمية (الأعمدة الأولى تظهر في بداية الجدول). يمكنك أيضاً تحديد عرض العمود (بالبكسل) لضمان تنسيق الطباعة بشكل سليم.
                    </p>
                </section>
            </GenericGuideModal>
        </div>
    );
};
