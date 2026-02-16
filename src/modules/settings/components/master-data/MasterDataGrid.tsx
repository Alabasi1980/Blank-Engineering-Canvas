
import React, { useState, useMemo } from 'react';
import { 
    ChevronRight, ChevronDown, FolderTree, CircleDot, Edit2, Trash2, Plus, 
    Hash, Calendar, ToggleLeft, AlignLeft, List, AlertTriangle, 
    CheckSquare, Square, Activity, Database
} from 'lucide-react';
import { GenericTreeNode, MasterEntityDefinition, Transaction } from '../../../../types';
import { useData } from '../../../../core/context/DataContext';
import { useFormatters } from '../../../../hooks/useFormatters';
import { SchemaService } from '../../../../core/services/SchemaService';
import { useCompany } from '../../../../context/CompanyContext';

interface MasterDataGridProps {
    items: GenericTreeNode[];
    entityDef: MasterEntityDefinition;
    searchTerm: string;
    onAddChild: (parentId: string) => void;
    onEdit: (item: GenericTreeNode) => void;
    onDelete: (item: GenericTreeNode) => void;
    onToggleStatus: (item: GenericTreeNode) => void;
    selectedIds: Set<string>;
    onSelect: (id: string, selected: boolean) => void;
    onSelectAll: (ids: string[]) => void;
}

export const MasterDataGrid: React.FC<MasterDataGridProps> = ({
    items,
    entityDef,
    searchTerm,
    onAddChild,
    onEdit,
    onDelete,
    onToggleStatus,
    selectedIds,
    onSelect,
    onSelectAll
}) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const { datasets } = useData();
    const { config } = useCompany();
    const { formatNumber } = useFormatters();

    const isTree = entityDef.hierarchy?.enabled || entityDef.isTree;
    const idHeader = entityDef.keyFieldLabel || 'الرمز (ID)';
    const nameHeader = entityDef.labelFieldLabel || 'الاسم الهيكلي';

    const statsMap = useMemo(() => {
        const stats = new Map<string, { count: number, total: number }>();
        const allTx = Object.values(datasets).flat() as Transaction[];
        
        allTx.forEach(tx => {
            const val = SchemaService.getValue(tx, entityDef.id, config);
            if (val) {
                const strVal = String(val);
                const current = stats.get(strVal) || { count: 0, total: 0 };
                stats.set(strVal, { 
                    count: current.count + 1, 
                    total: current.total + (tx.amount || 0) 
                });
            }
        });
        return stats;
    }, [datasets, entityDef.id, config]);

    const maxTotal = useMemo(() => {
        const totals = Array.from(statsMap.values()).map((s: { total: number }) => s.total);
        return Math.max(...totals, 1);
    }, [statsMap]);

    const extraColumns = useMemo(() => {
        if (!entityDef.fields || entityDef.fields.length === 0) {
            return [{ key: 'description', label: 'الوصف', width: '20%', icon: AlignLeft }];
        }
        return entityDef.fields.slice(0, 2).map(field => {
            let Icon = AlignLeft;
            if (field.type === 'number') Icon = Hash;
            if (field.type === 'date') Icon = Calendar;
            if (field.type === 'boolean') Icon = ToggleLeft;
            if (field.type === 'select') Icon = List;

            return {
                key: field.key,
                label: field.label,
                width: '15%',
                icon: Icon,
                type: field.type,
                options: field.options
            };
        });
    }, [entityDef]);

    const toggleExpand = (id: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const flatRows = useMemo(() => {
        const nodeMap = new Map<string, GenericTreeNode & { children: string[], isOrphan?: boolean }>();
        const roots: string[] = [];

        items.forEach(item => {
            nodeMap.set(item.id, { ...item, children: [] });
        });

        items.forEach(item => {
            if (item.parentId) {
                if (nodeMap.has(item.parentId)) {
                    nodeMap.get(item.parentId)!.children.push(item.id);
                } else {
                    const orphanNode = nodeMap.get(item.id)!;
                    orphanNode.isOrphan = true;
                    roots.push(item.id);
                }
            } else {
                roots.push(item.id);
            }
        });

        const visibleIds = new Set<string>();
        const term = searchTerm.trim().toLowerCase();
        
        const checkMatch = (id: string): boolean => {
            const node = nodeMap.get(id);
            if (!node) return false;
            let isMatch = !term || node.name.toLowerCase().includes(term) || node.id.toLowerCase().includes(term);
            let childMatch = false;
            node.children.forEach(childId => { if (checkMatch(childId)) childMatch = true; });
            if (isMatch || childMatch) {
                visibleIds.add(id);
                return true;
            }
            return false;
        };

        roots.forEach(checkMatch);

        const rows: { node: GenericTreeNode & { isOrphan?: boolean }; level: number; hasChildren: boolean }[] = [];
        const visited = new Set<string>();

        const traverse = (ids: string[], level: number) => {
            ids.forEach(id => {
                if (!visibleIds.has(id) || visited.has(id)) return;
                visited.add(id);
                const node = nodeMap.get(id)!;
                const hasChildren = node.children.length > 0;
                rows.push({ node, level, hasChildren });
                if (hasChildren && (expandedNodes.has(id) || term)) {
                    traverse(node.children, level + 1);
                }
            });
        };

        if (!isTree) {
            return roots.concat(Array.from(nodeMap.values()).filter(n => n.parentId).map(n => n.id))
                .filter(id => checkMatch(id))
                .map(id => ({ node: nodeMap.get(id)!, level: 0, hasChildren: false }));
        }

        traverse(roots, 0);
        return rows;
    }, [items, searchTerm, expandedNodes, isTree]);

    const handleHeaderCheckbox = () => {
        if (selectedIds.size === items.length && items.length > 0) onSelectAll([]);
        else onSelectAll(items.map(i => i.id));
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-txt-muted bg-surface-input/30 m-6 rounded-3xl border-2 border-dashed border-border-subtle">
                <Database size={48} className="mb-2 opacity-20" />
                <p className="font-bold">لا توجد بيانات لهذه القائمة</p>
                <p className="text-xs">اضغط على "إضافة جديد" أو قم باستيراد ملف Excel</p>
            </div>
        );
    }

    const allSelected = items.length > 0 && selectedIds.size === items.length;
    const someSelected = selectedIds.size > 0 && !allSelected;

    return (
        <div className="flex-1 overflow-auto custom-scrollbar border-t border-border-subtle bg-transparent">
            <table className="w-full text-right border-collapse min-w-[1000px]">
                <thead className="bg-surface-overlay/80 backdrop-blur-md sticky top-0 z-30 text-[10px] font-black uppercase tracking-widest text-txt-secondary shadow-sm">
                    <tr>
                        <th className="px-4 py-4 w-10 text-center">
                            <button onClick={handleHeaderCheckbox} className="text-txt-muted hover:text-primary-400 transition-colors">
                                {allSelected ? <CheckSquare size={16} className="text-primary-500" /> : someSelected ? <div className="w-4 h-4 bg-primary-500 rounded flex items-center justify-center"><div className="w-2 h-0.5 bg-white"></div></div> : <Square size={16} />}
                            </button>
                        </th>
                        <th className="px-6 py-4 w-[25%]">{nameHeader}</th>
                        <th className="px-4 py-4 w-[12%]">{idHeader}</th>
                        
                        {extraColumns.map(col => (
                            <th key={col.key} className="px-4 py-4" style={{ width: col.width }}>
                                <div className="flex items-center gap-1">{col.icon && <col.icon size={12} />}{col.label}</div>
                            </th>
                        ))}

                        <th className="px-4 py-4 w-[20%]">
                            <div className="flex items-center gap-1 text-primary-400"><Activity size={12} /> النشاط المالي</div>
                        </th>

                        <th className="px-4 py-4 w-[8%] text-center">الحالة</th>
                        <th className="px-4 py-4 w-[10%] text-center">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                    {flatRows.map(({ node, level, hasChildren }) => {
                        const isEnabled = node.enabled !== false;
                        const opacity = isEnabled ? 'opacity-100' : 'opacity-50 grayscale';
                        const isSelected = selectedIds.has(node.id);
                        const stats = statsMap.get(node.id) || { count: 0, total: 0 };
                        const barWidth = Math.min(100, (stats.total / maxTotal) * 100);
                        
                        return (
                            <tr 
                                key={node.id} 
                                className={`group hover:bg-white/5 transition-all ${opacity} ${isSelected ? 'bg-primary-500/10' : ''} cursor-pointer`}
                                onDoubleClick={() => onEdit(node)}
                                onClick={() => onSelect(node.id, !isSelected)}
                            >
                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => onSelect(node.id, !isSelected)} className="text-txt-muted hover:text-primary-400">
                                        {isSelected ? <CheckSquare size={16} className="text-primary-500" /> : <Square size={16} />}
                                    </button>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center" style={{ paddingRight: `${level * 20}px` }}>
                                        {isTree && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                                                className={`p-1 rounded hover:bg-primary-500/20 text-txt-muted transition-colors ${hasChildren ? 'visible' : 'invisible'}`}
                                            >
                                                {expandedNodes.has(node.id) || searchTerm ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                        )}
                                        <div className="flex items-center gap-2 mr-1">
                                            {node.isOrphan && isTree && (
                                                <span title="الأب غير موجود">
                                                    <AlertTriangle size={14} className="text-amber-500" />
                                                </span>
                                            )}
                                            {node.type === 'detail' ? <CircleDot size={12} className="text-txt-muted" /> : <FolderTree size={14} className="text-primary-400" />}
                                            <span className="text-sm font-bold text-txt-main truncate max-w-[200px]">{node.name}</span>
                                            {node.isSystem && <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded border border-amber-500/20 font-black">SYSTEM</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <code className="text-[10px] font-mono bg-surface-input text-txt-secondary px-1.5 py-0.5 rounded border border-border-subtle">{node.id}</code>
                                </td>

                                {extraColumns.map(col => (
                                    <td key={col.key} className="px-4 py-3 text-xs text-txt-secondary truncate">
                                        {node[col.key] === true ? 'نعم' : node[col.key] === false ? 'لا' : (node[col.key] || '-')}
                                    </td>
                                ))}

                                <td className="px-4 py-3">
                                    {stats.count > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-black text-txt-main">{formatNumber(stats.total)}</span>
                                                <span className="text-txt-muted">({stats.count} حركة)</span>
                                            </div>
                                            <div className="h-1 w-full bg-surface-input rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${barWidth}%` }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-txt-muted italic opacity-50">لا يوجد نشاط</span>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleStatus(node); }}
                                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter transition-all ${isEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-surface-input text-txt-muted border-border-subtle'}`}
                                    >
                                        {isEnabled ? 'ACTIVE' : 'DISABLED'}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(node); }} className="p-1.5 text-txt-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit2 size={14} /></button>
                                        {isTree && <button onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }} className="p-1.5 text-txt-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><Plus size={14} /></button>}
                                        {!node.isSystem && <button onClick={(e) => { e.stopPropagation(); onDelete(node); }} className="p-1.5 text-txt-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
