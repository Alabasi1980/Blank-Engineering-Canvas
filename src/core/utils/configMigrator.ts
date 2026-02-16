
import { CompanyConfig, BrandingConfig } from '../../types';
import { defaultCompanyConfig } from '../../config/defaultCompanyConfig';

/**
 * Known keys for the BrandingConfig according to the current generic schema.
 * Any key NOT in this list found in legacy data will be treated as a System Constant.
 */
const VALID_BRANDING_KEYS = new Set([
    'companyName', 'subtitle', 'reportHeader', 'reportSubtitle', 
    'systemUser', 'userEmail', 'sidebarColor', 'reportPrefix', 
    'reportFooter', 'dateFormat', 'numberFormat', 'logo'
]);

/**
 * Ensures that any config object conforms to the current application schema.
 * Merges loaded data with the default configuration to ensure all new fields exist.
 * This migration is "Blind" - it does not know about specific business domains.
 */
export const migrateConfig = (loadedData: any): CompanyConfig => {
    if (!loadedData) return defaultCompanyConfig;

    const systemConstants = { ...defaultCompanyConfig.systemConstants, ...(loadedData.systemConstants || {}) };
    
    // Agnostic Migration: Move non-standard branding fields to systemConstants dynamically
    if (loadedData.branding && typeof loadedData.branding === 'object') {
        Object.keys(loadedData.branding).forEach(key => {
            if (!VALID_BRANDING_KEYS.has(key)) {
                // If it's a legacy or custom field, move it to constants
                systemConstants[key] = loadedData.branding[key];
                // Remove it from branding to maintain type integrity
                delete loadedData.branding[key];
            }
        });
    }

    // Standard structural merge to ensure essential objects exist
    const safeConfig: CompanyConfig = {
        ...defaultCompanyConfig, 
        ...loadedData,
        
        systemConstants, // Apply dynamically migrated constants

        // Ensure Schema exists
        schema: {
            ...defaultCompanyConfig.schema,
            ...(loadedData.schema || {})
        },

        // Ensure Branding exists (after dynamic cleanup)
        branding: {
            ...defaultCompanyConfig.branding,
            ...(loadedData.branding || {})
        },

        // Ensure Logic Registry exists
        logicRegistry: {
            ...defaultCompanyConfig.logicRegistry,
            ...(loadedData.logicRegistry || {}),
            formulas: loadedData.logicRegistry?.formulas || [],
            variables: loadedData.logicRegistry?.variables || []
        },

        // Ensure Arrays are valid and not null
        dashboards: Array.isArray(loadedData.dashboards) ? loadedData.dashboards : defaultCompanyConfig.dashboards,
        dataSources: Array.isArray(loadedData.dataSources) ? loadedData.dataSources : [],
        integrationProfiles: Array.isArray(loadedData.integrationProfiles) ? loadedData.integrationProfiles : [],
        importProfiles: Array.isArray(loadedData.importProfiles) ? loadedData.importProfiles : [],
        dimensionsRegistry: Array.isArray(loadedData.dimensionsRegistry) ? loadedData.dimensionsRegistry : defaultCompanyConfig.dimensionsRegistry,
        
        // Definitions (Lists)
        definitions: {
            ...(loadedData.definitions || {}),
            importAliases: loadedData.definitions?.importAliases || defaultCompanyConfig.definitions.importAliases
        }
    };

    return safeConfig;
};
