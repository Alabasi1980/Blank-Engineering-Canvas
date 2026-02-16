import { useMemo } from 'react';
import { PivotConfig } from '../../types';
import { useLabelResolver } from '../../hooks/useLabelResolver';
import { useCompany } from '../../context/CompanyContext';
import { useMasterDataStore } from '../../context/MasterDataStoreContext';
import { PivotService } from '../../core/services/PivotService';

export const usePivotCalculations = ({ data, config: pivotConfig }: { data: any[], config: PivotConfig }) => {
    const { resolveLabel } = useLabelResolver();
    const { config: companyConfig } = useCompany();
    const { allMasterData } = useMasterDataStore();

    return useMemo(() => {
        return PivotService.pivot(data, pivotConfig, companyConfig, allMasterData as any, resolveLabel);
    }, [data, pivotConfig, companyConfig, allMasterData, resolveLabel]);
};