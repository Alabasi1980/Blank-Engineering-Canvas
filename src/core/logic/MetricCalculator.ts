
/**
 * MetricCalculator Orchestrator
 * Central point for all data aggregation and transaction processing logic.
 */
import { TimeService } from '../services/TimeService';
import { LogicEngineService } from '../services/LogicEngineService';

export const toDateStr = TimeService.toDateStr;

// Consolidation mapping
export const matchesRuleAttributes = LogicEngineService.matchesRule.bind(LogicEngineService);
export const evaluateTransactionImpact = LogicEngineService.evaluateImpact.bind(LogicEngineService);

export * from './MetricCalculator/MetricEngine';
// Fix: Export traceTransactionRules from the trace file
export * from './MetricCalculator/TransactionTrace';
