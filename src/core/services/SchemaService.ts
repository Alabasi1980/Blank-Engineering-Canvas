import { Transaction, CompanyConfig, GenericTreeNode, DimensionDefinition } from '../../types';

export const SchemaService = {
    /**
     * Resolves the raw value of a dimension from a transaction row.
     */
    getValue(tx: Partial<Transaction>, dimId: string, config?: CompanyConfig): any {
        if (!tx) return null;
        const schemaField = config?.schema?.fields?.find(f => f.id === dimId);
        if (schemaField?.binding) {
            if (schemaField.binding.startsWith('attributes.')) return tx.attributes?.[schemaField.binding.split('.')[1]];
            if (schemaField.binding in tx) return (tx as any)[schemaField.binding];
        }
        return (tx as any)[dimId] ?? tx.attributes?.[dimId] ?? null;
    },

    /**
     * Resolves the human-readable label for a dimension value, including hierarchy paths.
     */
    getLabel(config: CompanyConfig, masterData: Record<string, GenericTreeNode[]>, dimId: string, value: any): string {
        if (value === undefined || value === null || value === '' || value === 'all') return 'الكل';
        const strVal = String(value);
        const dimDef = config.dimensionsRegistry?.find(d => d.id === dimId);
        
        if (dimDef?.type === 'master_data') {
            const list = masterData[dimDef.sourceEntityId || dimId] || [];
            const item = list.find(x => String(x.id) === strVal);
            if (!item) return strVal;
            
            const parts = [item.name];
            let curr = item;
            const visited = new Set([strVal]);
            while (curr.parentId && !visited.has(curr.parentId)) {
                visited.add(curr.parentId);
                const p = list.find(x => x.id === curr.parentId);
                if (p) { 
                    parts.unshift(p.name); 
                    curr = p; 
                } else break;
            }
            return parts.join(' / ');
        }
        
        if (dimDef?.type === 'list') {
            const listKey = dimDef.sourceEntityId || dimId;
            return (config.definitions as any)?.[listKey]?.find((i: any) => i.id === strVal)?.label || strVal;
        }
        
        return strVal;
    },

    getDefinition(config: CompanyConfig, dimId: string): DimensionDefinition | undefined {
        return config.dimensionsRegistry?.find(d => d.id === dimId);
    }
};