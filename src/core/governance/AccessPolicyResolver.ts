import { UserGroup, DimensionRestriction } from '../../types';

/**
 * AccessPolicyResolver
 * Transforms user group permissions into mandatory logic filters.
 */
export const AccessPolicyResolver = {
    /**
     * Merges user-requested filters with enforced organizational restrictions.
     */
    mergeRestrictions: (activeFilters: Record<string, any>, group?: UserGroup): Record<string, any> => {
        if (!group || !group.restrictions || group.restrictions.length === 0) {
            return activeFilters;
        }

        const merged = { ...activeFilters };

        group.restrictions.forEach(restriction => {
            const dimId = restriction.dimensionId;
            
            if (restriction.enforced) {
                const currentFilter = merged[dimId];
                
                if (currentFilter !== undefined && currentFilter !== null) {
                    const currentValues = Array.isArray(currentFilter) ? currentFilter : [currentFilter];
                    
                    // Intersection: Allowed values only
                    const validSelection = currentValues.filter((v: any) => 
                        restriction.allowedValues.includes(String(v))
                    );

                    // If user tried to access unauthorized data, force the restriction set
                    if (validSelection.length === 0) {
                        merged[dimId] = restriction.allowedValues;
                    } else {
                        merged[dimId] = validSelection;
                    }
                } else {
                    // Inject restriction if not selected by user
                    merged[dimId] = restriction.allowedValues;
                }
            }
        });

        return merged;
    }
};