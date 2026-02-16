import { Transaction, PivotConfig, DerivedMeasure, CompanyConfig, GenericTreeNode } from '../../types';
import { LogicEngineService } from './LogicEngineService';
import { SchemaService } from './SchemaService';

export const PivotService = {
    calculateAggregation(items: { value: number, context: Record<string, number> }[], metricDef: any, config: CompanyConfig): number {
        if (!items || items.length === 0) return 0;
        
        const formula = config.logicRegistry?.formulas?.find(f => f.id === metricDef.sourceField);
        if (formula && formula.scope === 'aggregate') {
            const aggContext: Record<string, number> = {};
            items.forEach(i => {
                Object.entries(i.context).forEach(([k, v]) => {
                    aggContext[k] = (aggContext[k] || 0) + v;
                });
            });
            return LogicEngineService.evaluate(formula.expression, aggContext);
        }

        const values = items.map(i => i.value);
        switch(metricDef.operation) {
            case 'sum': return values.reduce((a, b) => a + b, 0);
            case 'count': return values.length;
            case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
            case 'max': return Math.max(...values);
            case 'min': return Math.min(...values);
            default: return 0;
        }
    },

    solveMeasures(baseMetrics: Record<string, number>, config: PivotConfig): Record<string, number> {
        const derived = config.derivedMeasures;
        if (!derived || derived.length === 0) return baseMetrics;
        const results = { ...baseMetrics };
        
        derived.forEach(dm => {
            let expression = dm.expression;
            config.values.forEach(v => {
                const regex = new RegExp(`\\[${v.id}\\]`, 'g');
                expression = expression.replace(regex, (baseMetrics[v.id] || 0).toString());
            });
            results[dm.id] = LogicEngineService.evaluate(expression, {});
        });
        return results;
    },

    pivot(data: any[], config: PivotConfig, companyConfig: CompanyConfig, masterData: Record<string, GenericTreeNode[]>, resolver: Function) {
        const rawTree: Record<string, any> = {};
        const colKeys = new Set<string>();

        data.forEach(item => {
            const tx = item.transaction;
            const rowVal = SchemaService.getValue(tx, config.rowField, companyConfig);
            const rowKey = resolver(config.rowField, rowVal || tx.id);
            
            let colKey = 'All';
            if (config.colField !== 'none') {
                const colVal = SchemaService.getValue(tx, config.colField, companyConfig);
                colKey = resolver(config.colField, colVal || tx.id);
                colKeys.add(colKey);
            }

            if (!rawTree[rowKey]) rawTree[rowKey] = {};
            if (!rawTree[rowKey][colKey]) rawTree[rowKey][colKey] = {};

            const txContext = LogicEngineService.buildContext(tx, companyConfig, masterData);

            config.values.forEach(metric => {
                if (!rawTree[rowKey][colKey][metric.id]) rawTree[rowKey][colKey][metric.id] = [];
                
                let val = 0;
                if (metric.sourceField === 'records') val = 1;
                else {
                    const pseudoRule: any = {
                        id: 'p', order: 0, conditions: [], 
                        valueBasis: metric.sourceField === 'amount' ? 'system_amount' : metric.sourceField,
                        effectNature: item.effect, enabled: true
                    };
                    val = LogicEngineService.evaluateImpact(tx, pseudoRule, false, companyConfig, masterData);
                }
                rawTree[rowKey][colKey][metric.id].push({ value: val, context: txContext });
            });
        });

        const rows: Record<string, any> = {};
        const sortedRowKeys = Object.keys(rawTree).sort();
        const sortedColKeys = Array.from(colKeys).sort();

        sortedRowKeys.forEach(rowKey => {
            rows[rowKey] = {};
            const rowMetricItems: Record<string, any[]> = {};
            config.values.forEach(m => rowMetricItems[m.id] = []);

            const colsToProcess = config.colField !== 'none' ? sortedColKeys : ['All'];
            colsToProcess.forEach(colKey => {
                const baseVals: Record<string, number> = {};
                config.values.forEach(metric => {
                    const items = rawTree[rowKey][colKey]?.[metric.id] || [];
                    rowMetricItems[metric.id].push(...items);
                    baseVals[metric.id] = this.calculateAggregation(items, metric, companyConfig);
                });
                rows[rowKey][colKey] = this.solveMeasures(baseVals, config);
            });

            const rowTotalBases: Record<string, number> = {};
            config.values.forEach(metric => {
                rowTotalBases[metric.id] = this.calculateAggregation(rowMetricItems[metric.id], metric, companyConfig);
            });
            rows[rowKey]['_total'] = this.solveMeasures(rowTotalBases, config);
        });

        const grandTotals: Record<string, any> = {};
        const totalOfTotalsBases: Record<string, number> = {};
        const colsToSum = config.colField !== 'none' ? sortedColKeys : ['All'];

        colsToSum.forEach(colKey => {
            const colTotalBases: Record<string, number> = {};
            config.values.forEach(metric => {
                const allColItems: any[] = [];
                sortedRowKeys.forEach(r => { if(rawTree[r][colKey]?.[metric.id]) allColItems.push(...rawTree[r][colKey][metric.id]); });
                colTotalBases[metric.id] = this.calculateAggregation(allColItems, metric, companyConfig);
            });
            grandTotals[colKey] = this.solveMeasures(colTotalBases, config);
        });

        config.values.forEach(metric => {
            const allItems: any[] = [];
            Object.values(rawTree).forEach(r => Object.values(r).forEach(c => { if(c[metric.id]) allItems.push(...c[metric.id]); }));
            totalOfTotalsBases[metric.id] = this.calculateAggregation(allItems, metric, companyConfig);
        });

        return { rows, sortedRowKeys, sortedColKeys, grandTotals, totalOfTotals: this.solveMeasures(totalOfTotalsBases, config) };
    }
};