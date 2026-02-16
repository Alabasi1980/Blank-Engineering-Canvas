
import { useMemo } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useMasterDataStore } from '../context/MasterDataStoreContext';

/**
 * Shared hook to provide the necessary context (config + master data)
 * for the MetricEngine and HierarchyMatcher.
 * Centralizing this prevents duplication in DashboardWidget and LivePreviewCard.
 * 
 * OPTIMIZATION: Returns a stable object reference unless version changed.
 */
export const useMetricContext = () => {
    const { config, configVersion } = useCompany();
    const { allMasterData, dataVersion } = useMasterDataStore();

    // Only recreate this context object when the underlying data actually changes
    // This is critical for preventing DashboardWidgets from recalculating when not needed.
    return useMemo(() => ({
        config,
        masterData: allMasterData // Now mapped directly to the generic record
    }), [configVersion, dataVersion, config, allMasterData]); 
};
