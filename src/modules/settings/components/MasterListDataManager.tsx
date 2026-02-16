
import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Loader2, Search, Plus, Download, Upload, Trash2, HardDrive, Info, FolderInput, Save, X } from 'lucide-react';
import { useCompany } from '../../../context/CompanyContext';
import { useMasterDataStore } from '../../../context/MasterDataStoreContext';
import { useUI } from '../../../context/UIContext';
import { useMasterData } from '../../../hooks/useMasterData';
import { MasterDataSidebar } from './master-data/MasterDataSidebar';
import { MasterDataGrid } from './master-data/MasterDataGrid';
import { MasterDataEditorModal } from './master-data/MasterDataEditorModal';
import { GenericTreeNode, MasterEntityType } from '../../../types';
import { Button } from '../../../shared/components/Button';
import { ImportWizard } from './import/ImportWizard';
import { ExportService } from '../../../core/services/ExportService';
import { useModal } from '../../../context/ModalContext';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';
import { EmptyState } from '../../../shared/components/EmptyState';
import { LoadingState } from '../../../shared/components/LoadingState';
import { SettingHelpBlock } from './system/SettingHelpBlock';
import { GenericGuideModal } from './system/GenericGuideModal';
import { useFileSystem } from '../../../hooks/useFileSystem';

export const MasterListDataManager: React.FC = () => {
    const { config } = useCompany();
    const { getEntityData, saveEntityData, isSyncing, isLoading, restoreFromDiskData } = useMasterDataStore();
    const { showToast } = useUI();
    const { confirm } = useModal();
    const { executeSyncProfile, deleteRegistryItem } = useMasterData();
    const { directoryHandle, permissionState, linkDirectory, verifyPermission, saveMasterDataFile, loadMasterDataFile, checkMasterDataExists } = useFileSystem();

    const [selectedId, setSelectedId] = useState<string>(config.masterEntities?.[0]?.id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncingLocal, setIsSyncingLocal] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GenericTreeNode | undefined>(undefined);
    const [parentForNewItem, setParentForNewItem] = useState<string | undefined>(undefined);
    
    const [importView, setImportView] = useState(false);
    const [hasDiskBackup, setHasDiskBackup] = useState(false);

    const activeEntity = config.masterEntities?.find(e => e.id === selectedId);
    const items = getEntityData(selectedId);

    useEffect(() => {
        const check = async () => {
            if (directoryHandle && permissionState === 'granted' && selectedId) {
                const exists = await checkMasterDataExists(selectedId);
                setHasDiskBackup(exists);
            }
        };
        check();
    }, [directoryHandle, permissionState, selectedId, checkMasterDataExists]);

    const handleOpenAdd = (parentId?: string) => {
        setEditingItem(undefined);
        setParentForNewItem(parentId);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: GenericTreeNode) => {
        setEditingItem(item);
        setParentForNewItem(undefined);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (data: Partial<GenericTreeNode>) => {
        let finalId = data.id?.trim();
        if (!finalId) {
            const prefix = activeEntity?.id.slice(0, 3).toUpperCase() || 'ITM';
            finalId = `${prefix}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
        }

        const newItem: GenericTreeNode = {
            ...data, 
            id: finalId,
            name: data.name?.trim() || 'New Item',
            parentId: data.parentId || undefined,
            description: data.description || '',
            enabled: data.enabled !== false,
            type: data.type || (activeEntity?.isTree ? 'detail' : 'header'), 
            isSystem: data.isSystem
        } as GenericTreeNode;

        const exists = items.some(i => i.id === newItem.id);
        let newItems = [...items];
        
        if (exists && editingItem) {
            newItems = items.map(i => i.id === newItem.id ? { ...i, ...newItem } : i);
        } else if (exists && !editingItem) {
            showToast('هذا المعرف (ID) موجود مسبقاً', 'error');
            return;
        } else {
            newItems.push(newItem);
        }

        await saveEntityData(selectedId, newItems);
        
        if (directoryHandle && permissionState === 'granted') {
            await saveMasterDataFile(selectedId, newItems);
        }

        setIsModalOpen(false);
        showToast('تم حفظ البيانات بنجاح');
    };

    const handleDelete = async (item: GenericTreeNode) => {
        const success = await deleteRegistryItem(selectedId, item.id, item.name);
        if (success && directoryHandle && permissionState === 'granted') {
             const updatedList = items.filter(i => i.id !== item.id);
             await saveMasterDataFile(selectedId, updatedList);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;
        if (await confirm({ 
            title: 'حذف متعدد', 
            message: `هل أنت متأكد من حذف ${selectedItems.size} عنصر؟ سيتم فحص الارتباطات لكل عنصر.`, 
            variant: 'danger',
            confirmText: 'حذف المحدد'
        })) {
            let currentList = [...items];
            for (const id of Array.from(selectedItems)) {
               const item = currentList.find(i => i.id === id);
               if (item) {
                   const success = await deleteRegistryItem(selectedId, id as string, item.name);
                   if (success) currentList = currentList.filter(i => i.id !== id);
               }
            }
            if (directoryHandle && permissionState === 'granted') await saveMasterDataFile(selectedId, currentList);
            setSelectedItems(new Set());
            showToast(`تمت عملية الحذف بنجاح`);
        }
    };

    const handleToggleStatus = (item: GenericTreeNode) => {
        const newItems = items.map(i => i.id === item.id ? { ...i, enabled: i.enabled === false } : i);
        saveEntityData(selectedId, newItems);
        if (directoryHandle && permissionState === 'granted') saveMasterDataFile(selectedId, newItems);
    };

    const handleSync = async () => {
        const profile = config.integrationProfiles?.find(p => p.targetEntity === (selectedId as MasterEntityType));
        
        if (!profile) {
            showToast('لا يوجد اتصال API معرف لهذه القائمة', 'error');
            return;
        }
        
        setIsSyncingLocal(true);
        try { 
            const r = await executeSyncProfile(profile.id); 
            if (directoryHandle && permissionState === 'granted') {
                const freshData = getEntityData(selectedId);
                await saveMasterDataFile(selectedId, freshData);
            }
            showToast(`تمت المزامنة بنجاح: ${r.added} جديد، ${r.updated} تحديث`); 
        } catch (e: any) { 
            const message = e?.message || String(e);
            showToast(message, 'error'); 
        } finally { 
            setIsSyncingLocal(false); 
        }
    };

    const handleExport = () => {
        const exportData = items.map(item => {
            const row: any = { 'المعرف': item.id, 'الاسم': item.name, 'الأب': item.parentId || '', 'النوع': item.type === 'header' ? 'رئيسي' : 'تفصيلي', 'الحالة': item.enabled !== false ? 'نشط' : 'معطل' };
            activeEntity?.fields?.forEach(f => { row[f.label] = item[f.key]; });
            return row;
        });
        ExportService.exportExcel(exportData, activeEntity?.label || 'export', config.branding);
    };

    if (importView) {
        return (
            <div className="flex-1 flex flex-col h-full animate-fade-in-up glass-card p-8 rounded-3xl border border-border-subtle bg-surface-card">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-txt-main">معالج الاستيراد للقائمة: {activeEntity?.label}</h3>
                    <button onClick={() => setImportView(false)} className="p-2 bg-surface-input hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"><X size={20}/></button>
                </div>
                <ImportWizard 
                    mode="master_data" 
                    targetEntityId={selectedId} 
                    onComplete={() => { setImportView(false); showToast('تم التحديث بنجاح'); }}
                    onCancel={() => setImportView(false)}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full animate-fade-in pb-10 overflow-y-auto custom-scrollbar">
            <SettingsSectionHeader 
                title="إدارة مدخلات القوائم (Master Data)"
                description="تعبئة وتحديث بيانات القوائم المرجعية التي قمت بتعريفها في هيكلية النظام."
                icon={Database}
                bgClass="bg-blue-500/10"
                iconColorClass="text-blue-400"
                action={
                    <div className="flex items-center gap-2">
                        {!directoryHandle ? (
                            <Button size="sm" variant="secondary" onClick={linkDirectory} icon={<FolderInput size={14}/>}>ربط مجلد الحفظ</Button>
                        ) : (
                            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-bold">
                                <HardDrive size={14} /> متصل بالقرص
                            </div>
                        )}
                    </div>
                }
            />

            <div className="flex-1 flex overflow-hidden border border-border-subtle rounded-3xl glass-card relative min-h-[500px] bg-surface-card shadow-sm">
                <MasterDataSidebar entities={config.masterEntities || []} selectedId={selectedId} onSelect={setSelectedId} />
                
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {isLoading ? (
                        <LoadingState message="جاري تحميل البيانات..." />
                    ) : activeEntity ? (
                        <>
                            <div className="px-6 py-4 border-b border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-overlay z-20">
                                <div className="flex-1 w-full max-w-md relative">
                                    <Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-txt-muted" />
                                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={`بحث في ${activeEntity.label}...`} className="input-fantasy w-full pr-9 pl-4 py-2 text-sm font-bold"/>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    {selectedItems.size > 0 && <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 animate-fade-in"><Trash2 size={16} /> حذف المحدد ({selectedItems.size})</button>}
                                    <div className="flex bg-surface-input p-1 rounded-xl shadow-inner border border-border-subtle">
                                        <button onClick={() => setImportView(true)} className="p-2 text-txt-muted hover:text-green-400 hover:bg-surface-card rounded-lg transition-all" title="استيراد Excel"><Upload size={18} /></button>
                                        <button onClick={handleExport} className="p-2 text-txt-muted hover:text-blue-400 hover:bg-surface-card rounded-lg transition-all" title="تصدير Excel"><Download size={18} /></button>
                                        <button onClick={handleSync} disabled={isSyncingLocal || isSyncing} className="p-2 text-txt-muted hover:text-purple-400 hover:bg-surface-card rounded-lg transition-all" title="مزامنة API">{isSyncingLocal ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}</button>
                                    </div>
                                    <Button onClick={() => handleOpenAdd()} size="sm" icon={<Plus size={16} />}>إضافة جديد</Button>
                                </div>
                            </div>

                            <MasterDataGrid 
                                items={items} entityDef={activeEntity} searchTerm={searchTerm} onAddChild={handleOpenAdd}
                                onEdit={handleOpenEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus}
                                selectedIds={selectedItems} onSelectAll={(ids) => setSelectedItems(new Set(ids))}
                                onSelect={(id, selected) => { const next = new Set(selectedItems); if (selected) next.add(id); else next.delete(id); setSelectedItems(next); }}
                            />

                            {isModalOpen && (
                                <MasterDataEditorModal 
                                    isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem}
                                    initialData={editingItem} parentID={parentForNewItem} allItems={items} entityDef={activeEntity}
                                />
                            )}
                        </>
                    ) : <EmptyState icon={Database} title="حدد قائمة لإدارتها" description="اختر إحدى القوائم المرجعية من القائمة الجانبية." className="text-txt-muted" />}
                </div>
            </div>

            <div className="shrink-0">
                <SettingHelpBlock title="دليل إدارة البيانات الموحد" description="كل ما تستورده من ملفات Excel يمر الآن عبر محرك النزاهة الموحد لضمان عدم تكرار المعرفات وبناء شجرة البيانات سليمة." onClick={() => setIsHelpOpen(true)} color="emerald" />
            </div>

            <GenericGuideModal title="الاستيراد والهيكلية" isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)}>
                <section className="space-y-4">
                    <h3 className="text-lg font-black text-txt-main">قواعد الاستيراد الموحد</h3>
                    <p className="text-sm text-txt-secondary leading-relaxed">
                        عند استيراد أي قائمة (مثل شجرة الحسابات)، سيقوم المحرك بالتحقق من وجود <strong>المعرف (ID)</strong>. 
                        إذا وجده، سيقوم بتحديث بياناته؛ وإذا لم يجده، سيضيفه كعنصر جديد. هذه العملية تسمى (Upsert) وتضمن أنك لن تكرر الحسابات أبداً.
                    </p>
                </section>
            </GenericGuideModal>
        </div>
    );
};
