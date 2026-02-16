import { Transaction, RuleRow, CardDataType, CompanyConfig, AlertRule } from '../../../types';
import { TimeService } from '../../services/TimeService';
import { LogicEngineService } from '../../services/LogicEngineService';

export interface ProcessedTransactionDetail {
    transaction: Transaction;
    calculatedValue: number;
    effect: 'add' | 'subtract' | 'neutral';
    ruleId: string;
}

export interface MetricResult {
    currentValue: number; prevValue: number; yoyValue: number;
    annualValue: number; cumulativeValue: number; trendData: number[];
    integrity: { orphanCount: number; totalCount: number; };
    activeAlerts: AlertRule[];
}

export const processTransactionsDetails = (
    transactions: Transaction[], rules: RuleRow[], start: Date, end: Date,
    context: { config: CompanyConfig, masterData: Record<string, any[]> }
): ProcessedTransactionDetail[] => {
    const sStr = start.toISOString();
    const eStr = end.toISOString();
    const activeRules = (rules || []).filter(r => r.enabled !== false);
    const results: ProcessedTransactionDetail[] = [];

    transactions.forEach(tx => {
        if (tx.date >= sStr && tx.date <= eStr) {
            for (const rule of activeRules) {
                if (LogicEngineService.matchesRule(tx, rule, context.config, context.masterData)) {
                    results.push({
                        transaction: tx,
                        calculatedValue: LogicEngineService.evaluateImpact(tx, rule, false, context.config, context.masterData),
                        effect: rule.effectNature,
                        ruleId: rule.id
                    });
                    if (!rule.continueProcessing) break;
                }
            }
        }
    });
    return results;
};

export const calculateWidgetMetrics = (
    transactions: Transaction[], rules: RuleRow[],
    currentRange: { start: string; end: string }, 
    prevRange: { start: string; end: string },    
    dataType: CardDataType,
    context: { config: CompanyConfig, masterData: Record<string, any[]> }
): MetricResult => {
    const isCount = dataType === 'integer_count';
    const current = TimeService.normalizeRange(currentRange.start, currentRange.end);
    const previous = TimeService.normalizeRange(prevRange.start, prevRange.end);

    let currentValue = 0, prevValue = 0, cumulativeValue = 0;
    const activeRules = (rules || []).filter(r => r.enabled !== false);

    (transactions || []).forEach(tx => {
        for (const rule of activeRules) {
            if (LogicEngineService.matchesRule(tx, rule, context.config, context.masterData)) {
                const val = LogicEngineService.evaluateImpact(tx, rule, isCount, context.config, context.masterData);
                if (tx.date <= current.end) cumulativeValue += val;
                if (tx.date >= current.start && tx.date <= current.end) currentValue += val;
                if (tx.date >= previous.start && tx.date <= previous.end) prevValue += val;
                if (!rule.continueProcessing) break;
            }
        }
    });

    return {
        currentValue, prevValue, yoyValue: 0, annualValue: 0, cumulativeValue,
        trendData: [], integrity: { orphanCount: 0, totalCount: transactions.length },
        activeAlerts: []
    };
};