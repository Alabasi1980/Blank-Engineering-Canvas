import { Transaction, RuleRow, CompanyConfig } from '../../../types';
import { LogicEngineService } from '../../services/LogicEngineService';

export interface RuleTraceResult {
    rule: RuleRow;
    isMatch: boolean;
    impact: number;
    runningTotal: number;
    conditions: {
        field: string;
        actual: any;
        expected: string;
        operatorLabel: string;
        isMatch: boolean;
    }[];
    formulaUsed?: string;
}

/**
 * TransactionTrace Engine
 * Provides detailed forensics on how the engine processed a specific transaction.
 */
// Fix: Restored traceTransactionRules as a functional wrapper around LogicEngineService.trace
export const traceTransactionRules = (
    tx: Partial<Transaction>, 
    rules: RuleRow[], 
    context: { config: CompanyConfig, masterData: Record<string, any[]> }
): RuleTraceResult[] => {
    const traceResults = LogicEngineService.trace(tx, rules, context);
    
    return traceResults.map(res => {
        const conditions = (res.rule.conditions || []).map(c => {
            const actual = tx.attributes?.[c.dimensionId] || (tx as any)[c.dimensionId];
            // Individual condition match check
            const isMatch = LogicEngineService.matchesRule(tx, { ...res.rule, conditions: [c] }, context.config, context.masterData);
            
            return {
                field: context.config.dimensionsRegistry?.find(d => d.id === c.dimensionId)?.label || c.dimensionId,
                actual,
                expected: c.values.join(', '),
                operatorLabel: c.operator === 'in' ? 'يتضمن' : c.operator,
                isMatch
            };
        });

        return {
            ...res,
            conditions,
            formulaUsed: res.rule.valueBasis !== 'system_amount' ? res.rule.valueBasis : undefined
        };
    });
};