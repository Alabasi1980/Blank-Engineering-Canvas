
import React, { useMemo, useState, useEffect } from 'react';
import { SubCard, Transaction } from '../types';
import { calculateWidgetMetrics, toDateStr, processTransactionsDetails } from '../core/logic/MetricCalculator';
import { useData } from '../core/context/DataContext';
import { useDashboardFilters } from '../core/context/DashboardFiltersContext';
import { useMetricContext } from '../hooks/useMetricContext';
import { DashboardWidgetCard } from './dashboard/DashboardWidgetCard';
import { DashboardWidgetModal } from './dashboard/DashboardWidgetModal';
import { TimeService } from '../core/services/TimeService';
import { AlertCircle } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

interface DashboardWidgetProps {
  card: SubCard;
  selectedDate: Date;
  dashboardDataSourceId?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ card, selectedDate, dashboardDataSourceId }) => {
  const { dataAdapter } = useData();
  const { config } = useCompany();
  const { filters, filtersHash } = useDashboardFilters(); 
  const treeContext = useMetricContext();
  
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const effectiveUnitLabel = useMemo(() => {
    if (config.currencySettings?.autoConversionEnabled) {
        return config.currencySettings.baseCurrency;
    }
    return card.unit || config.systemConstants?.['currencySymbol'] || config.systemConstants?.['default_unit'] || '';
  }, [config.currencySettings, config.systemConstants, card.unit]);

  const resetMonth = card.annualResetMonth || Number(config.systemConstants?.['annual_reset_month']) || 1;
  const effectiveDataSourceId = card.dataSourceId || dashboardDataSourceId;

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const dynamicFilters = Object.fromEntries(
                Object.entries(filters).filter(([k]) => !['dateFrom', 'dateTo'].includes(k))
            );

            const result = await dataAdapter.getTransactions({
                dataSourceId: effectiveDataSourceId, 
                filters: dynamicFilters
            }); 
            setData(result);
        } catch (e) {
            console.error("DATASOURCE_FAILED", e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [dataAdapter, filtersHash, effectiveDataSourceId]); 

  const metrics = useMemo(() => {
    if (loading) return { currentValue: 0, prevValue: 0, yoyValue: 0, annualValue: 0, cumulativeValue: 0, percentChange: 0, trendData: [], integrity: { orphanCount: 0, totalCount: 0 }, activeAlerts: [] };

    const currentStart = filters.dateFrom || TimeService.toDateStr(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const currentEnd = filters.dateTo || TimeService.toDateStr(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));
    const prevRange = TimeService.getPreviousPeriod(currentStart, currentEnd);

    const result = calculateWidgetMetrics(
        data, 
        card.rules,
        { start: currentStart, end: currentEnd },
        prevRange,
        card.dataType, 
        treeContext
    );

    const diff = result.currentValue - result.prevValue;
    const percentChange = result.prevValue !== 0 ? (diff / Math.abs(result.prevValue)) * 100 : 0;
    return { ...result, percentChange };
  }, [data, card.rules, card.alerts, card.dataType, filters.dateFrom, filters.dateTo, selectedDate, loading, treeContext, resetMonth]);

  const rawDetailsData = useMemo(() => {
      if (!showDetails || loading) return [];
      const cS = filters.dateFrom ? new Date(filters.dateFrom) : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const cE = filters.dateTo ? new Date(filters.dateTo) : new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      return processTransactionsDetails(data, card.rules, cS, cE, treeContext);
  }, [showDetails, card.rules, filters.dateFrom, filters.dateTo, selectedDate, data, loading, treeContext]);

  if (loading && data.length === 0) return <div className="bg-surface-card rounded-xl border border-border-subtle h-48 animate-pulse opacity-50"></div>;

  return (
    <div className="relative group">
      <DashboardWidgetCard 
        card={card} 
        metrics={metrics} 
        unit={effectiveUnitLabel} 
        onClick={() => setShowDetails(true)} 
      />
      
      {metrics.integrity.orphanCount > 0 && (
          <div className="absolute top-2 left-2 z-10" title={`تحذير: يوجد ${metrics.integrity.orphanCount} حركة يتيمة`}>
              <AlertCircle size={14} className="text-amber-500 fill-amber-50" />
          </div>
      )}

      {showDetails && (
        <DashboardWidgetModal 
           card={card} 
           rawDetailsData={rawDetailsData} 
           selectedDate={selectedDate}
           currencySymbol={effectiveUnitLabel} 
           totalValue={metrics.currentValue}
           onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};
