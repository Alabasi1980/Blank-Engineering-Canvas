import { useCallback } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useMasterDataStore } from '../context/MasterDataStoreContext';
import { SchemaService } from '../core/services/SchemaService';

/**
 * Unified Label Resolver Hook
 * Acts as the UI layer's gateway to the generic resolution logic.
 */
export const useLabelResolver = () => {
    const { config } = useCompany();
    const { allMasterData } = useMasterDataStore();

    /**
     * getSystemLabel: Retrieves the display name of a Dimension itself (Column Header).
     */
    const getSystemLabel = useCallback((dimId: string) => {
        const dim = SchemaService.getDefinition(config, dimId);
        if (dim) return dim.label;

        // Fallback for custom attributes
        /* Fix: Use the new customAttributes property on CompanyConfig */
        const attr = config.customAttributes?.find(a => a.id === dimId);
        if (attr) return attr.label;

        return dimId;
    }, [config]);

    /**
     * resolveLabel: Resolves the value of a specific Item within a Dimension.
     * Delegates entirely to the generic core resolver.
     */
    const resolveLabel = useCallback((field: string, id: string): string => {
        return SchemaService.getLabel(config, allMasterData as any, field, id);
    }, [config, allMasterData]);

    return { resolveLabel, getSystemLabel };
};