import { CompanyConfig, RuleRow } from '../../types';
// Fix: Replace import from deleted RuleAdapter with LogicEngineService
import { LogicEngineService } from '../services/LogicEngineService';

/**
 * IntegrityService
 * The absolute authority on data relationships and deletion safety.
 */
export const IntegrityService = {
    /**
     * Checks if a master data item is used in any dashboard rule across the entire config.
     */
    checkMasterDataItemUsage(config: CompanyConfig, entityId: string, itemId: string): string[] {
        const usages: string[] = [];
        
        // Identify all dimensions linked to this entity
        const targetDimensionIds = new Set<string>([entityId]);
        if (config.dimensionsRegistry) {
            config.dimensionsRegistry.forEach(dim => {
                if (dim.sourceEntityId === entityId) {
                    targetDimensionIds.add(dim.id);
                }
            });
        }

        // Scan all dashboards
        (config.dashboards || []).forEach(dash => {
            (dash.mainCards || []).forEach(card => {
                (card.subCards || []).forEach(sub => {
                    const rules = sub.rules || [];
                    const isUsed = rules.some(rule => {
                        // Fix: Use LogicEngineService for condition normalization
                        const conditions = LogicEngineService.normalizeRuleConditions(rule);
                        return conditions.some(c => 
                            targetDimensionIds.has(c.dimensionId) && 
                            Array.isArray(c.values) && 
                            c.values.includes(itemId)
                        );
                    });
                    if (isUsed) usages.push(`${dash.title} > ${card.title} > ${sub.title}`);
                });
            });
        });

        // Scan Logic Variables
        const isUsedInVariables = (config.logicRegistry?.variables || []).some(v => 
            v.sourceType !== 'system_constant' && targetDimensionIds.has(v.sourceKey)
        );
        if (isUsedInVariables) usages.push(`مهندس المنطق (Variables Registry)`);

        return usages;
    }
};