import { IntegrationProfile, GenericTreeNode } from '../../types';
// Fix: Import from NetworkService as apiUtils was consolidated
import { NetworkService } from '../services/NetworkService';

export const IntegrationExecutor = {
    execute: async (profile: IntegrationProfile): Promise<GenericTreeNode[]> => {
        const { apiConfig, fieldMapping } = profile;
        
        // 1. Fetch Data using NetworkService
        const dataArray = await NetworkService.fetch(apiConfig);

        // 2. Map Fields
        const mappedData: GenericTreeNode[] = dataArray.map(item => {
            const node: GenericTreeNode = {
                id: String(item[fieldMapping['id']] || '').trim(),
                name: String(item[fieldMapping['name']] || '').trim(),
                parentId: fieldMapping['parentId'] ? String(item[fieldMapping['parentId']] || '').trim() : undefined,
            };
            
            // Map extra fields if they exist in mapping and source
            // e.g., 'type' for hierarchical entities or custom attributes
            Object.keys(fieldMapping).forEach(targetKey => {
                if (targetKey !== 'id' && targetKey !== 'name' && targetKey !== 'parentId') {
                    const sourceKey = fieldMapping[targetKey];
                    if (sourceKey && item[sourceKey] !== undefined) {
                        node[targetKey] = item[sourceKey];
                    }
                }
            });

            return node;
        }).filter(n => n.id && n.name); // Filter invalid items

        return mappedData;
    }
};