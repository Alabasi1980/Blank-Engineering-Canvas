
import React, { useState } from 'react';
import { ShieldCheck, Lock, Plus, Trash2, Filter } from 'lucide-react';
import { useCompany } from '../../../../context/CompanyContext';
import { useMasterDataStore } from '../../../../context/MasterDataStoreContext';
import { UserGroup, DimensionRestriction } from '../../../../types';
import { Button } from '../../../../shared/components/Button';
import { SettingsSectionHeader } from './SettingsSectionHeader';
import { MultiSelect } from '../../../../shared/components/MultiSelect';

export const AccessGovernance: React.FC = () => {
    const { config } = useCompany();
    const { getEntityData, saveEntityData } = useMasterDataStore();
    const groups = getEntityData('user_groups') || [];
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id || null);

    const activeGroup = groups.find(g => g.id === selectedGroupId);

    const handleUpdateGroup = (updates: Partial<UserGroup>) => {
        if (!selectedGroupId) return;
        const newGroups = groups.map(g => g.id === selectedGroupId ? { ...g, ...updates } : g);
        saveEntityData('user_groups', newGroups);
    };

    const handleAddRestriction = () => {
        if (!activeGroup) return;
        const newRest: DimensionRestriction = {
            dimensionId: config.dimensionsRegistry[0].id,
            allowedValues: [],
            enforced: true
        };
        handleUpdateGroup({ restrictions: [...(activeGroup.restrictions || []), newRest] });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <SettingsSectionHeader 
                title="حوكمة الوصول والأذونات (Access Governance)"
                description="تحديد صلاحيات المجموعات بناءً على أبعاد البيانات. يمكنك تقييد وصول مجموعة معينة لترى فقط بيانات منطقة أو فرع محدد."
                icon={ShieldCheck}
                bgClass="bg-indigo-500/10"
                iconColorClass="text-indigo-400"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
                {/* قائمة المجموعات */}
                <div className="lg:col-span-1 glass-card rounded-3xl border border-border-subtle overflow-hidden flex flex-col shadow-sm bg-surface-card">
                    <div className="p-4 bg-surface-overlay border-b border-border-subtle font-black text-[10px] text-txt-muted uppercase tracking-widest">مجموعات النظام</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {groups.map(group => (
                            <button 
                                key={group.id} 
                                onClick={() => setSelectedGroupId(group.id)}
                                className={`w-full text-right p-4 rounded-2xl text-xs font-bold transition-all ${selectedGroupId === group.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-surface-overlay text-txt-secondary hover:text-txt-main'}`}
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* محرر القيود */}
                <div className="lg:col-span-3 glass-card rounded-3xl border border-border-subtle overflow-hidden flex flex-col shadow-xl relative bg-surface-card">
                    {!activeGroup ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-txt-muted">
                            <Lock size={48} className="mb-4 opacity-10" />
                            <span className="font-bold">اختر مجموعة لتعديل سياسات الوصول</span>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-overlay">
                                <div>
                                    <h3 className="text-lg font-black text-txt-main">{activeGroup.name}</h3>
                                    <p className="text-[10px] text-txt-muted uppercase font-bold tracking-widest mt-1">سياسات تقييد الأبعاد (Dimension Restrictions)</p>
                                </div>
                                <Button size="sm" onClick={handleAddRestriction} icon={<Plus size={14}/>}>إضافة قيد جديد</Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                                {(activeGroup.restrictions || []).map((rest, idx) => (
                                    <div key={idx} className="p-5 glass-card border border-border-subtle rounded-3xl shadow-sm hover:border-indigo-500/30 transition-all space-y-4 bg-surface-card">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20"><Filter size={16}/></div>
                                                <select 
                                                    value={rest.dimensionId}
                                                    onChange={e => {
                                                        const newRests = [...activeGroup.restrictions];
                                                        newRests[idx].dimensionId = e.target.value;
                                                        handleUpdateGroup({ restrictions: newRests });
                                                    }}
                                                    className="bg-transparent font-black text-txt-main outline-none cursor-pointer border-b border-transparent hover:border-indigo-500/50 transition-colors"
                                                >
                                                    {config.dimensionsRegistry.map(d => (
                                                        <option key={d.id} value={d.id}>{d.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateGroup({ restrictions: activeGroup.restrictions.filter((_, i) => i !== idx) })}
                                                className="text-txt-muted hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">القيم المسموح بها لهذه المجموعة</label>
                                            <RestrictionValuesSelector 
                                                dimensionId={rest.dimensionId} 
                                                values={rest.allowedValues}
                                                onChange={(vals) => {
                                                    const newRests = [...activeGroup.restrictions];
                                                    newRests[idx].allowedValues = vals;
                                                    handleUpdateGroup({ restrictions: newRests });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {activeGroup.restrictions.length === 0 && (
                                    <div className="py-20 text-center text-txt-muted italic text-sm">لا توجد قيود مفروضة. هذه المجموعة ترى كافة البيانات.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const RestrictionValuesSelector = ({ dimensionId, values, onChange }: any) => {
    const { config } = useCompany();
    const { getEntityData } = useMasterDataStore();
    const dim = config.dimensionsRegistry.find(d => d.id === dimensionId);
    
    if (!dim) return null;

    let options: { value: string, label: string }[] = [];
    if (dim.type === 'master_data') {
        options = getEntityData(dim.sourceEntityId || dim.id).map(i => ({ value: i.id, label: i.name }));
    } 
    /* Fix: 'list' is now a valid DimensionType */
    else if (dim.type === 'list') {
        const listKey = dim.sourceEntityId || dim.id;
        const list = (config.definitions as any)[listKey] || [];
        options = list.map((i: any) => ({ value: i.id, label: i.label }));
    }

    return (
        <MultiSelect 
            options={options} 
            selectedValues={values} 
            onChange={onChange} 
            label="" 
            placeholder="اختر القيم المسموحة..." 
        />
    );
};
