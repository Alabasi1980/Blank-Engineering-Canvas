
import { ImportMapping, CompanyConfig, ImportMode } from '../../types';

/**
 * Calculates a match score between a file header and a list of keywords.
 * Agnostic logic: just string comparison.
 */
const calculateScore = (header: string, keywords: string[]): number => {
    if (!keywords || keywords.length === 0) return 0;
    const normalizedHeader = header.toLowerCase().trim().replace(/[_-\s]/g, '');
    for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim().replace(/[_-\s]/g, '');
        if (normalizedHeader === normalizedKeyword) return 100;
        if (normalizedHeader.includes(normalizedKeyword)) return 50;
    }
    return 0;
};

/**
 * The Brain of the Ingestion Wizard.
 * It maps file columns to System Primitives or User Dimensions.
 * CRITICAL: It no longer "guesses" based on hardcoded lists.
 */
export const detectSmartMapping = (
    fileColumns: string[], 
    config: CompanyConfig,
    mode: ImportMode = 'transactions',
    targetEntityId?: string
): Partial<ImportMapping> => {
    const mapping: Partial<ImportMapping> = { customAttributes: {} };
    const usedColumns = new Set<string>();

    // Zero-State Rule: If the user hasn't defined any aliases in the config, 
    // the system should remain "Blind" to protect integrity.
    const allowAutoDetect = config.settings?.ingestion?.autoDetectCoreFields ?? false;

    // 1. Map System Primitives (Required for the Engine Pipeline)
    // These IDs are reserved in the Transaction Interface (date, amount, etc.)
    const coreFields = mode === 'transactions' ? [
        { id: 'date', fallbackKeywords: ['date', 'time', 'تاريخ'] },
        { id: 'amount', fallbackKeywords: ['amount', 'value', 'value_base', 'قيمة'] },
        { id: 'description', fallbackKeywords: ['description', 'desc', 'وصف'] },
        { id: 'sourceRef', fallbackKeywords: ['ref', 'reference', 'مرجع'] }
    ] : [
        { id: 'id', fallbackKeywords: ['id', 'code', 'معرف'] },
        { id: 'name', fallbackKeywords: ['name', 'label', 'اسم', 'مسمى'] },
        { id: 'parentId', fallbackKeywords: ['parent', 'group', 'أب'] }
    ];

    coreFields.forEach(field => {
        // Find User-Defined Aliases in the current configuration
        const userDefined = config.definitions?.importAliases?.find(a => a.fieldId === field.id);
        
        // Strategy: 
        // 1. Prioritize user's "Import Aliases" registry.
        // 2. Only if "Allow Auto Detect" is enabled, use the minimal fallback list.
        let keywords: string[] = userDefined ? [...userDefined.keywords] : [];
        if (allowAutoDetect) {
            keywords = [...keywords, ...field.fallbackKeywords];
        }

        if (keywords.length === 0) return;

        let bestMatchCol = '';
        let highestScore = 0;

        fileColumns.forEach((col) => {
            if (usedColumns.has(col)) return;
            const score = calculateScore(col, keywords);
            if (score > highestScore) { 
                highestScore = score; 
                bestMatchCol = col; 
            }
        });

        if (highestScore > 0) {
            (mapping as any)[field.id] = bestMatchCol;
            usedColumns.add(bestMatchCol);
        }
    });

    // 2. Map User-Defined Dimensions (The "Agnostic" Part)
    // Here we traverse the user's specific "Dimension Registry".
    if (mode === 'transactions' && config.dimensionsRegistry) {
        config.dimensionsRegistry.forEach(dim => {
            if (!dim.enabled || !dim.ui.import) return;
            if (['date', 'amount', 'description', 'sourceRef'].includes(dim.id)) return;

            // Collect all possible hints from the user's definition
            const keywords = [
                ...(dim.importAliases || []),
                dim.label,
                dim.id
            ];

            let bestMatchCol = '';
            let highestScore = 0;
            
            fileColumns.forEach((col) => {
                if (usedColumns.has(col)) return;
                const score = calculateScore(col, keywords);
                if (score > highestScore) { 
                    highestScore = score; 
                    bestMatchCol = col; 
                }
            });
            
            if (highestScore > 0) {
                // Map directly to the generic attribute bag
                if (!mapping.customAttributes) mapping.customAttributes = {};
                mapping.customAttributes[dim.id] = bestMatchCol;
                usedColumns.add(bestMatchCol);
            }
        });
    }

    // 3. Map Entity Fields (For Master Data Mode)
    if (mode === 'master_data' && targetEntityId) {
        const entityDef = config.masterEntities?.find(e => e.id === targetEntityId);
        entityDef?.fields?.forEach(field => {
            const keywords = [field.label, field.key];
            let bestMatchCol = '';
            let highestScore = 0;
            
            fileColumns.forEach((col) => {
                if (usedColumns.has(col)) return;
                const score = calculateScore(col, keywords);
                if (score > highestScore) { 
                    highestScore = score; 
                    bestMatchCol = col; 
                }
            });

            if (highestScore > 0) {
                if (!mapping.customAttributes) mapping.customAttributes = {};
                mapping.customAttributes[field.key] = bestMatchCol;
                usedColumns.add(bestMatchCol);
            }
        });
    }

    return mapping;
};
