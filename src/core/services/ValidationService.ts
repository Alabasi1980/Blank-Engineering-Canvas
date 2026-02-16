import { CompanyConfig, Transaction, ValidationError, RuleRow, GenericTreeNode } from '../../types';

/**
 * ValidationService
 * The system's "Self-Healing" monitor. Detects logical inconsistencies.
 */
export const ValidationService = {
    /**
     * Exhaustive configuration audit.
     */
    validateConfig(config: CompanyConfig): { valid: boolean; errors: ValidationError[] } {
        const errors: ValidationError[] = [];
        const dimIds = new Set((config.dimensionsRegistry || []).map(d => d.id));
        const formulaIds = new Set((config.logicRegistry?.formulas || []).map(f => f.id));

        // 1. Check Logic Registry
        (config.logicRegistry?.variables || []).forEach(v => {
            if (v.sourceType !== 'system_constant' && !dimIds.has(v.sourceKey)) {
                errors.push({ field: 'variables', message: `المتغير [${v.id}] يرتبط ببعد مفقود: ${v.sourceKey}`, severity: 'error' });
            }
        });

        // 2. Check Dashboard Rules for Dangling References
        (config.dashboards || []).forEach(dash => {
            dash.mainCards.forEach(mc => {
                mc.subCards.forEach(sc => {
                    sc.rules.forEach((rule, idx) => {
                        rule.conditions.forEach(cond => {
                            if (!dimIds.has(cond.dimensionId)) {
                                errors.push({ 
                                    field: 'rules', 
                                    message: `البطاقة [${sc.title}] تحتوي قاعدة (رقم ${idx+1}) تشير لبعد محذوف: ${cond.dimensionId}`, 
                                    severity: 'warning' 
                                });
                            }
                        });
                        if (rule.valueBasis !== 'system_amount' && !formulaIds.has(rule.valueBasis)) {
                            errors.push({ 
                                field: 'rules', 
                                message: `البطاقة [${sc.title}] تستخدم معادلة مفقودة: ${rule.valueBasis}`, 
                                severity: 'error' 
                            });
                        }
                    });
                });
            });
        });

        return { valid: !errors.some(e => e.severity === 'error'), errors };
    },

    /**
     * Detects circular references in hierarchical master data.
     */
    checkCircularReference(itemId: string, newParentId: string, allItems: GenericTreeNode[]): boolean {
        if (!newParentId) return false;
        if (itemId === newParentId) return true;

        let currentParent = allItems.find(i => i.id === newParentId);
        const visited = new Set<string>([itemId]);

        while (currentParent) {
            if (visited.has(currentParent.id)) return true;
            visited.add(currentParent.id);
            if (!currentParent.parentId) break;
            currentParent = allItems.find(i => i.id === currentParent!.parentId);
        }
        return false;
    },

    /**
     * Data sanity check for incoming ingestion.
     */
    validateTransaction(tx: any): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        if (!tx.date || tx.date === 'undefined' || tx.date === 'null') errors.push("التاريخ مفقود");
        if (isNaN(parseFloat(String(tx.amount)))) errors.push("القيمة الرقمية تالفة");
        return { valid: errors.length === 0, errors };
    }
};