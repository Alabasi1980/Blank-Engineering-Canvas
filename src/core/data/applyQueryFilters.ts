
import { Transaction, CompanyConfig, RuleCondition, UserGroup } from '../../types';
import { DataQuery } from './types';
// Fix: Replace import from deleted HierarchyMatcher with LogicEngineService
import { LogicEngineService } from '../services/LogicEngineService';
import { AccessPolicyResolver } from '../governance/AccessPolicyResolver';

/**
 * Applies standard data query filters dynamically based on the Company Config.
 * Law of Governance: Now enforces UserGroup restrictions.
 */
export const applyQueryFilters = (
    data: Transaction[], 
    query: DataQuery,
    context?: { config: CompanyConfig, masterData: any, activeGroup?: UserGroup }
): Transaction[] => {
    
    // 1. Date Filtering
    let filteredData = data;
    if (query.dateFrom || query.dateTo) {
        filteredData = filteredData.filter(tx => {
            if (query.dateFrom && tx.date < query.dateFrom) return false;
            if (query.dateTo && tx.date > query.dateTo) return false;
            return true;
        });
    }

    // 2. Governance Injection (Step 11)
    // ندمج قيود المجموعة مع الفلاتر المطلوبة قبل البدء بالمعالجة
    const effectiveFilters = AccessPolicyResolver.mergeRestrictions(
        query.filters || {}, 
        context?.activeGroup
    );

    if (Object.keys(effectiveFilters).length === 0) {
        return filteredData;
    }

    // 3. Generic Filtering using LogicEngineService
    if (context) {
        const conditions: RuleCondition[] = [];

        Object.entries(effectiveFilters).forEach(([dimId, values]) => {
            if (!values || (Array.isArray(values) && values.length === 0)) return;
            
            conditions.push({
                dimensionId: dimId,
                operator: 'in',
                values: Array.isArray(values) ? values : [values]
            });
        });

        const dummyRule: any = { id: 'filter_dummy', conditions, enabled: true };

        return filteredData.filter(tx => 
            LogicEngineService.matchesRule(tx, dummyRule, context.config, context.masterData)
        );
    } 
    
    return filteredData;
};
