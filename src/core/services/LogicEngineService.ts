import { Transaction, CompanyConfig, RuleRow, RuleCondition, ConditionOperator, GenericTreeNode } from '../../types';
import { SchemaService } from './SchemaService';

const compiledFormulaCache = new Map<string, Function>();

export const LogicEngineService = {
    // --- Formula Engine ---
    sanitize(expression: string): string {
        return expression.replace(/[^a-zA-Z0-9_+\-*/%().,\s]/.test(expression) ? /[^a-zA-Z0-9_+\-*/%().,\s]/g : '', '');
    },

    compile(expression: string): Function {
        if (compiledFormulaCache.has(expression)) return compiledFormulaCache.get(expression)!;
        const sanitized = this.sanitize(expression);
        const mathFunctions = ['round', 'floor', 'ceil', 'abs', 'min', 'max', 'pow', 'sqrt'];
        const transformed = sanitized.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match) => {
            if (mathFunctions.includes(match.toLowerCase())) return `Math.${match.toLowerCase()}`;
            if (/^\d/.test(match)) return match;
            return `(scope.${match} || 0)`;
        });
        try {
            const fn = new Function('scope', `try { return (${transformed}); } catch(e) { return 0; }`);
            compiledFormulaCache.set(expression, fn);
            return fn;
        } catch { return () => 0; }
    },

    evaluate(expression: string, context: Record<string, number>): number {
        if (!expression) return 0;
        const fn = this.compile(expression);
        const result = fn(context);
        return typeof result === 'number' && !isNaN(result) ? result : 0;
    },

    // --- Processing Context ---
    buildContext(tx: Transaction, config: CompanyConfig, masterData?: Record<string, any[]>): Record<string, number> {
        const context: Record<string, number> = { amount: tx.amount || 0 };
        if (config.currencySettings?.autoConversionEnabled) {
            const txCurrency = String(SchemaService.getValue(tx, config.currencySettings.currencyDimensionId, config) || config.currencySettings.baseCurrency);
            const rateObj = config.currencySettings.exchangeRates.find(r => r.code === txCurrency);
            context['exchange_rate'] = rateObj ? rateObj.rate : 1;
            context['base_amount'] = (tx.amount || 0) * (rateObj ? rateObj.rate : 1);
        }
        (config.logicRegistry?.variables || []).forEach(v => {
            const raw = SchemaService.getValue(tx, v.sourceKey, config);
            context[v.id] = typeof raw === 'number' ? raw : parseFloat(String(raw || '0').replace(/[^0-9.-]/g, '')) || 0;
        });
        return context;
    },

    // --- Core Rule Matching ---
    isSelfOrDescendant(actualId: string, targetId: string, treeData: any[]): boolean {
        if (!targetId || targetId === 'all' || targetId === '') return true;
        if (actualId === targetId) return true;
        const adjMap = new Map<string, string[]>();
        treeData.forEach(n => { if(n.parentId) { if(!adjMap.has(n.parentId)) adjMap.set(n.parentId, []); adjMap.get(n.parentId)!.push(n.id); } });
        const stack = [targetId];
        const visited = new Set<string>();
        while (stack.length > 0) {
            const curr = stack.pop()!;
            if (visited.has(curr)) continue;
            visited.add(curr);
            const children = adjMap.get(curr);
            if (children) { for (const child of children) { if (child === actualId) return true; stack.push(child); } }
        }
        return false;
    },

    matchesRule(tx: Partial<Transaction>, rule: RuleRow, config: CompanyConfig, masterData: Record<string, any[]>): boolean {
        const conditions = rule.conditions || [];
        for (const cond of conditions) {
            const actualValue = SchemaService.getValue(tx, cond.dimensionId, config);
            const dimDef = SchemaService.getDefinition(config, cond.dimensionId);
            const entityDef = config.masterEntities?.find(e => e.id === (dimDef?.sourceEntityId || cond.dimensionId));
            
            if (cond.operator === 'in') {
                if (entityDef?.hierarchy?.enabled) {
                    const treeData = masterData[entityDef.id] || [];
                    if (!cond.values.some(v => this.isSelfOrDescendant(String(actualValue), String(v), treeData))) return false;
                } else if (!cond.values.includes(String(actualValue))) return false;
            } else if (cond.operator === 'equals' && String(actualValue) !== String(cond.values[0])) return false;
        }
        return true;
    },

    evaluateImpact(tx: Transaction, rule: RuleRow, isCount: boolean, config: CompanyConfig, masterData?: Record<string, any[]>): number {
        if (isCount) return rule.effectNature === 'neutral' ? 0 : (rule.effectNature === 'subtract' ? -1 : 1);
        const context = this.buildContext(tx, config, masterData);
        let base = tx.amount;
        if (rule.valueBasis !== 'system_amount') {
            const formula = config.logicRegistry?.formulas?.find(f => f.id === rule.valueBasis);
            if (formula) base = this.evaluate(formula.expression, context);
        }
        return rule.effectNature === 'subtract' ? base * -1 : (rule.effectNature === 'neutral' ? 0 : base);
    },

    // --- Trace Engine (New: Forensics Core) ---
    trace(tx: Partial<Transaction>, rules: RuleRow[], context: { config: CompanyConfig, masterData: Record<string, any[]> }) {
        let runningTotal = 0;
        const activeRules = (rules || []).filter(r => r.enabled !== false);
        const traceResults = activeRules.map((rule, idx) => {
            const isMatch = this.matchesRule(tx, rule, context.config, context.masterData);
            let impact = 0;
            if (isMatch) {
                impact = this.evaluateImpact(tx as Transaction, rule, false, context.config, context.masterData);
                runningTotal += impact;
            }
            return { rule, isMatch, impact, runningTotal };
        });
        return traceResults;
    },

    // Fix: Added normalizeRuleConditions to LogicEngineService
    normalizeRuleConditions(rule: RuleRow): RuleCondition[] {
        return rule.conditions || [];
    },

    // Fix: Added updateRuleCondition to LogicEngineService
    updateRuleCondition(rule: RuleRow, dimensionId: string, values: any[], operator: ConditionOperator = 'in'): RuleRow {
        const conditions = [...(rule.conditions || [])];
        const idx = conditions.findIndex(c => c.dimensionId === dimensionId);
        
        if (idx >= 0) {
            if (values.length === 0 && operator === 'in') {
                conditions.splice(idx, 1);
            } else {
                conditions[idx] = { ...conditions[idx], values, operator };
            }
        } else if (values.length > 0 || operator !== 'in') {
            conditions.push({ dimensionId, values, operator });
        }
        
        return { ...rule, conditions };
    }
};