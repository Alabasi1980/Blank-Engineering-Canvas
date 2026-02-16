
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Lock, FolderTree, CircleDot, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';
import { SearchableSelect } from '../../../../shared/components/SearchableSelect';
import { GenericTreeNode, MasterEntityDefinition } from '../../../../types';
import { MasterDataService } from '../../../../core/services/MasterDataService';

export const MasterDataEditorModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData, allItems, entityDef, parentID }) => {
    const [formData, setFormData] = useState<Partial<GenericTreeNode>>({});
    const isEditMode = !!initialData;
    const isTree = entityDef.hierarchy?.enabled || entityDef.isTree;

    useEffect(() => {
        if (isOpen) {
            if (initialData) setFormData({ ...initialData });
            else {
                setFormData({
                    name: '', id: '', parentId: parentID || '', description: '',
                    enabled: true, type: isTree ? 'detail' : 'header',
                    ...(entityDef.fields || []).reduce((acc: any, f: any) => { acc[f.key] = f.type === 'boolean' ? false : ''; return acc; }, {})
                });
            }
        }
    }, [isOpen, initialData, parentID, entityDef, isTree]);

    const forbiddenParentIds = useMemo(() => isEditMode && initialData ? MasterDataService.getForbiddenParents(initialData.id, allItems) : new Set<string>(), [isEditMode, initialData, allItems]);
    const parentOptions = allItems.filter(i => !forbiddenParentIds.has(i.id)).map(i => ({ value: i.id, label: i.name, subLabel: i.id }));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-lg overflow-hidden border border-border-subtle flex flex-col max-h-[90vh] bg-surface-card shadow-2xl">
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-overlay">
                    <h3 className="font-bold text-txt-main text-lg">{isEditMode ? 'تعديل السجل' : `إضافة إلى ${entityDef.label}`}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-txt-muted hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    {isTree && (
                        <div className="flex bg-surface-input p-1 rounded-xl border border-border-subtle">
                            <button onClick={() => setFormData({...formData, type: 'header'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'header' ? 'bg-surface-card shadow-sm text-primary-400 border border-border-highlight' : 'text-txt-muted hover:text-txt-main'}`}>رئيسي (تجميعي)</button>
                            <button onClick={() => setFormData({...formData, type: 'detail'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'detail' ? 'bg-surface-card shadow-sm text-primary-400 border border-border-highlight' : 'text-txt-muted hover:text-txt-main'}`}>تفصيلي (للحركات)</button>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-txt-muted mb-1.5">{entityDef.keyFieldLabel || 'المعرف'}</label>
                            <input value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')})} disabled={isEditMode} className="input-fantasy w-full p-2.5 font-mono text-sm" dir="ltr" />
                            {isEditMode && <Lock size={14} className="absolute top-9 left-3 text-txt-muted" />}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-txt-muted mb-1.5">{entityDef.labelFieldLabel || 'الاسم'}</label>
                            <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="input-fantasy w-full p-2.5 text-sm font-bold" />
                        </div>
                    </div>
                    {isTree && (
                        <div>
                            <label className="block text-xs font-bold text-txt-muted mb-1.5">ينتمي إلى (الأب)</label>
                            <SearchableSelect options={parentOptions} value={formData.parentId || ''} onChange={v => setFormData({...formData, parentId: v})} placeholder="بدون (عنصر مستوى أول)" />
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-surface-overlay border-t border-border-subtle flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>إلغاء</Button>
                    <Button onClick={() => onSave(formData)} disabled={!formData.name?.trim()} icon={<Save size={16} />}>حفظ</Button>
                </div>
            </div>
        </div>
    );
};
