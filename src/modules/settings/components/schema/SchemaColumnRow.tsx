
import React from 'react';
import { ArrowUp, ArrowDown, Table, Trash2, Activity, Maximize2 } from 'lucide-react';

interface RoleDefinition {
    id: string;
    label: string;
    description: string;
    required: boolean;
    unique: boolean;
    icon: React.ElementType;
    color: string;
}

interface SchemaColumnRowProps {
    col: any;
    index: number;
    totalCount: number;
    roleDef?: RoleDefinition;
    systemRoles: RoleDefinition[];
    customSources: { id: string; label: string }[];
    onUpdate: (index: number, updates: any) => void;
    onDelete: (index: number) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
}

export const SchemaColumnRow: React.FC<SchemaColumnRowProps> = ({
    col,
    index,
    totalCount,
    roleDef,
    systemRoles,
    customSources,
    onUpdate,
    onDelete,
    onMove
}) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-surface-card p-3 rounded-xl border border-border-subtle shadow-sm group hover:border-primary-500/30 transition-all">
            {/* Reorder & Icon */}
            <div className="flex items-center gap-2 text-txt-muted">
                <div className="flex flex-col">
                    <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="hover:text-primary-400 disabled:opacity-20"><ArrowUp size={12}/></button>
                    <button onClick={() => onMove(index, 'down')} disabled={index === totalCount - 1} className="hover:text-primary-400 disabled:opacity-20"><ArrowDown size={12}/></button>
                </div>
                <div className={`p-2 rounded-lg bg-surface-input ${roleDef?.color || 'text-txt-secondary'}`}>
                    {roleDef?.icon ? <roleDef.icon size={18} /> : <Table size={18} />}
                </div>
            </div>

            {/* Column Definition */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                {/* Label Input */}
                <div>
                    <label className="text-[9px] font-bold text-txt-muted block mb-1">عنوان العمود (Label)</label>
                    <input 
                        type="text" 
                        value={col.label} 
                        onChange={e => onUpdate(index, { label: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-border-subtle rounded-lg outline-none focus:border-primary-500 bg-surface-input text-txt-main focus:bg-surface-overlay transition-colors"
                        placeholder="اسم العمود"
                    />
                </div>

                {/* Role Selector */}
                <div>
                    <label className="text-[9px] font-bold text-txt-muted block mb-1">الدور الوظيفي (System Role)</label>
                    <select 
                        value={col.role} 
                        onChange={e => onUpdate(index, { role: e.target.value })}
                        className={`w-full text-xs p-2 border rounded-lg outline-none focus:border-primary-500 cursor-pointer font-medium bg-surface-input text-txt-main ${roleDef?.required ? 'border-amber-500/30 text-amber-400' : 'border-border-subtle'}`}
                    >
                        {systemRoles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.label} {role.required ? '*' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mapping Source (Only for Custom) */}
                {col.role === 'custom' ? (
                    <div className="animate-fade-in">
                        <label className="text-[9px] font-bold text-txt-muted block mb-1">مصدر البيانات</label>
                        <select 
                            value={col.id} 
                            onChange={e => onUpdate(index, { id: e.target.value })}
                            className="w-full text-xs p-2 border border-border-subtle rounded-lg outline-none focus:border-primary-500 bg-surface-input text-txt-main"
                        >
                            {customSources.map(src => (
                                <option key={src.id} value={src.id}>{src.label}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    // Width Control
                    <div className="md:col-span-1">
                        <label className="text-[9px] font-bold text-txt-muted block mb-1 flex items-center gap-1"><Maximize2 size={10}/> العرض (px)</label>
                        <input 
                            type="number"
                            value={col.width || 120}
                            onChange={e => onUpdate(index, { width: parseInt(e.target.value) || 120 })}
                            className="w-full text-xs p-2 border border-border-subtle rounded-lg outline-none focus:border-primary-500 bg-surface-input text-txt-main text-center font-mono"
                        />
                    </div>
                )}
                
                {/* Extra Width Control spacer for Custom */}
                {col.role === 'custom' && (
                    <div className="md:col-span-1">
                        <label className="text-[9px] font-bold text-txt-muted block mb-1 flex items-center gap-1"><Maximize2 size={10}/> العرض (px)</label>
                        <input 
                            type="number"
                            value={col.width || 120}
                            onChange={e => onUpdate(index, { width: parseInt(e.target.value) || 120 })}
                            className="w-full text-xs p-2 border border-border-subtle rounded-lg outline-none focus:border-primary-500 bg-surface-input text-txt-main text-center font-mono"
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-2 border-l border-border-subtle ml-2">
                <button 
                    onClick={() => onUpdate(index, { required: !col.required })}
                    className={`p-1.5 rounded-lg transition-all ${col.required ? 'text-red-400 bg-red-500/10 ring-1 ring-red-500/30' : 'text-txt-muted hover:text-txt-secondary'}`}
                    title={col.required ? "حقل إلزامي" : "حقل اختياري"}
                >
                    <Activity size={16} />
                </button>
                <button 
                    onClick={() => onDelete(index)}
                    className="p-1.5 text-txt-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="حذف العمود"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
