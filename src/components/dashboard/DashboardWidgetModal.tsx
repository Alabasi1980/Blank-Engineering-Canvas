
import React, { useState, useMemo } from 'react';
import { SubCard, PivotConfig, ChartConfig } from '../../types';
import { CARD_COLORS } from '../../constants';
import { PivotTable } from '../PivotTable';
import { WidgetDetailsView } from './WidgetDetailsView';
import { SimpleBarChart, SimpleDonutChart } from '../../shared/components/SimpleCharts';
import { ChartControls } from './ChartControls';
import { ExportService } from '../../core/services/ExportService';
import { useCompany } from '../../context/CompanyContext';
import { useLabelResolver } from '../../hooks/useLabelResolver'; 
import { ModalHeader } from './modal/ModalHeader';
import { ModalTabs } from './modal/ModalTabs';
import { ProcessedTransactionDetail } from '../../core/logic/MetricCalculator';
import { useDashboardFilters } from '../../core/context/DashboardFiltersContext';
import { SchemaService } from '../../core/services/SchemaService';

interface DashboardWidgetModalProps {
  card: SubCard;
  rawDetailsData: ProcessedTransactionDetail[];
  selectedDate: Date;
  onClose: () => void;
  currencySymbol: string;
  totalValue: number;
}

export const DashboardWidgetModal: React.FC<DashboardWidgetModalProps> = ({
  card, rawDetailsData, selectedDate, onClose, currencySymbol, totalValue
}) => {
  const { resolveLabel } = useLabelResolver();
  const { config } = useCompany();
  const { filters } = useDashboardFilters();
  const [activeTab, setActiveTab] = useState<'pivot' | 'charts' | 'details'>('pivot');
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>(card.defaultPivotConfig || {
    rowField: 'category', colField: 'none', values: [{ id: 'v1', sourceField: 'amount', operation: 'sum', label: 'مجموع القيمة' }]
  });
  const [chartConfig, setChartConfig] = useState<ChartConfig>({ type: 'donut', dimension: 'category', measure: 'amount' });
  
  const [selectedChartLabel, setSelectedChartLabel] = useState<string | null>(null);

  const theme = CARD_COLORS.find(c => c.value === card.color) || CARD_COLORS[0];
  const activeSchema = config.tableSchemas?.find(s => s.id === card.tableSchemaId);
  
  const handleExport = () => {
      const exportedData = ExportService.prepareDetailsForExport(rawDetailsData, resolveLabel, activeSchema);
      ExportService.exportExcel(exportedData, card.title, config.branding, 'Transactions');
  };

  const chartData = useMemo(() => {
      const map = new Map<string, number>();
      rawDetailsData.forEach(item => {
          const tx = item.transaction;
          const val = SchemaService.getValue(tx, chartConfig.dimension, config);
          const label = resolveLabel(chartConfig.dimension, val || tx.id);
          const weight = chartConfig.measure === 'count' ? 1 : item.calculatedValue;
          map.set(label, (map.get(label) || 0) + weight);
      });
      return Array.from(map.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .filter(d => d.value !== 0);
  }, [rawDetailsData, chartConfig, config, resolveLabel]);

  const handleChartClick = (item: any) => {
      setSelectedChartLabel(item.label === selectedChartLabel ? null : item.label);
      setActiveTab('details');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
        <div className="glass-card w-[95vw] max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up border border-border-subtle shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-surface-card" onClick={e => e.stopPropagation()}>
            <ModalHeader title={card.title} selectedDate={selectedDate} matchCount={rawDetailsData.length} theme={theme} onExport={handleExport} onClose={onClose} />
            <ModalTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="flex-1 overflow-hidden relative flex flex-col bg-surface-app/50">
                {activeTab === 'pivot' && <PivotTable data={rawDetailsData} config={pivotConfig} onConfigChange={setPivotConfig} />}
                
                {activeTab === 'charts' && (
                    <div className="flex flex-col h-full">
                        <ChartControls config={chartConfig} onChange={setChartConfig} />
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="glass-card p-10 h-full flex flex-col items-center justify-center relative bg-surface-card/50">
                                <div className="mb-4 flex justify-between items-center w-full absolute top-6 left-0 px-6">
                                    <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">اضغط على العناصر للتحليل التفصيلي</span>
                                    {selectedChartLabel && (
                                        <button onClick={() => setSelectedChartLabel(null)} className="text-[10px] font-bold text-blue-400 hover:text-white hover:underline">إلغاء التحديد</button>
                                    )}
                                </div>
                                {chartConfig.type === 'donut' ? 
                                    <SimpleDonutChart 
                                        data={chartData} 
                                        valueFormatter={v => v.toLocaleString() + ' ' + (chartConfig.measure === 'amount' ? currencySymbol : '')} 
                                        height={350} 
                                        onItemClick={handleChartClick}
                                        selectedLabel={selectedChartLabel}
                                    /> : 
                                    <SimpleBarChart 
                                        data={chartData} 
                                        valueFormatter={v => v.toLocaleString()} 
                                        height={350} 
                                        onItemClick={handleChartClick}
                                        selectedLabel={selectedChartLabel}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'details' && (
                    <WidgetDetailsView 
                        data={rawDetailsData} 
                        currencySymbol={currencySymbol} 
                        totalValue={totalValue} 
                        externalFilter={selectedChartLabel ? { field: chartConfig.dimension as any, value: selectedChartLabel } : null} 
                        onClearExternalFilter={() => setSelectedChartLabel(null)}
                        rules={card.rules} 
                    />
                )}
            </div>
        </div>
    </div>
  );
};
