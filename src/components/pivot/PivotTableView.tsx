
import React from 'react';
import { AlignLeft, Filter, Zap } from 'lucide-react';
import { PivotConfig } from '../../types';
import { EmptyState } from '../../shared/components/EmptyState';
import { useFormatters } from '../../hooks/useFormatters';
import { useLabelResolver } from '../../hooks/useLabelResolver';

interface PivotTableViewProps {
  pivotData: {
    rows: Record<string, any>;
    sortedRowKeys: string[];
    sortedColKeys: string[];
    grandTotals: Record<string, Record<string, number>>;
    totalOfTotals: Record<string, number>;
  };
  config: PivotConfig;
  hasData: boolean;
}

export const PivotTableView: React.FC<PivotTableViewProps> = ({ pivotData, config, hasData }) => {
  const { formatNumber } = useFormatters();
  const { getSystemLabel } = useLabelResolver();
  const derivedCount = config.derivedMeasures?.length || 0;

  if (!hasData) {
      return (
          <EmptyState 
            icon={Filter}
            title="لا توجد نتائج"
            description="لم يتم العثور على بيانات مطابقة للمعايير الحالية. حاول تغيير الفلاتر أو قواعد البطاقة."
            className="!min-h-[250px] text-txt-muted"
          />
      );
  }

  const rowLabel = config.rowField === 'month' ? 'الشهر' : getSystemLabel(config.rowField);

  return (
    <div className="border border-border-subtle rounded-2xl overflow-hidden bg-surface-app/50 shadow-2xl">
        <table className="w-full text-xs md:text-sm border-collapse">
            <thead className="bg-surface-overlay text-txt-secondary font-bold sticky top-0 z-20 backdrop-blur-md">
                <tr className="shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                    <th rowSpan={2} className="p-3 text-right border-b border-border-subtle min-w-[200px] bg-surface-overlay z-30 sticky right-0 border-l border-border-subtle">
                        <div className="flex items-center gap-2 text-txt-secondary">
                            <AlignLeft size={14} />
                            {rowLabel}
                        </div>
                    </th>
                    
                    {config.colField !== 'none' ? (
                        pivotData.sortedColKeys.map(col => (
                            <th key={col} colSpan={config.values.length + derivedCount} className="px-2 py-3 text-center border-b border-border-subtle border-l border-border-subtle bg-surface-overlay/50 text-txt-main whitespace-nowrap">
                                {col}
                            </th>
                        ))
                    ) : null}
                    
                    <th colSpan={config.values.length + derivedCount} className="px-2 py-3 text-center border-b border-border-subtle border-l border-border-subtle bg-blue-900/20 text-blue-300 whitespace-nowrap">
                        الإجمالي الكلي
                    </th>
                </tr>

                <tr>
                    {config.colField !== 'none' && pivotData.sortedColKeys.map(col => (
                        <>
                            {config.values.map(metric => (
                                <th key={`${col}-${metric.id}`} className="px-2 py-2 text-center border-b border-border-subtle border-l border-border-subtle bg-surface-input text-txt-muted font-medium min-w-[100px] text-[10px] uppercase tracking-wider">
                                    {metric.label}
                                </th>
                            ))}
                            {(config.derivedMeasures || []).map(dm => (
                                <th key={`${col}-${dm.id}`} className="px-2 py-2 text-center border-b border-purple-500/20 border-l border-border-subtle bg-purple-900/20 text-purple-300 font-black min-w-[110px] text-[10px] uppercase tracking-wider">
                                    <div className="flex items-center justify-center gap-1"><Zap size={8}/> {dm.label}</div>
                                </th>
                            ))}
                        </>
                    ))}
                    
                    {config.values.map(metric => (
                        <th key={`total-${metric.id}`} className="px-2 py-2 text-center border-b border-border-subtle border-l border-blue-500/20 bg-blue-900/10 text-blue-300 font-bold min-w-[100px] text-[10px] uppercase tracking-wider">
                            {metric.label}
                        </th>
                    ))}
                    {(config.derivedMeasures || []).map(dm => (
                        <th key={`total-${dm.id}`} className="px-2 py-2 text-center border-b border-border-subtle border-l border-border-subtle bg-indigo-900/20 text-indigo-300 font-black min-w-[110px] text-[10px] uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1"><Zap size={8}/> {dm.label}</div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
                {pivotData.sortedRowKeys.map((rowKey, idx) => (
                    <tr key={rowKey} className={`group ${idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-input/30'} hover:bg-surface-overlay transition-colors`}>
                        <td className="p-3 font-bold text-txt-secondary border-l border-border-subtle sticky right-0 z-10 bg-surface-app border-b border-border-subtle whitespace-nowrap shadow-[1px_0_0_rgba(255,255,255,0.05)]">
                            {rowKey}
                        </td>
                        
                        {config.colField !== 'none' && pivotData.sortedColKeys.map(col => (
                            <>
                                {config.values.map(metric => {
                                    const val = pivotData.rows[rowKey][col]?.[metric.id] || 0;
                                    return (
                                        <td key={`${col}-${metric.id}`} className="p-3 text-center text-txt-muted border-l border-border-subtle tabular-nums">
                                            {val === 0 ? <span className="text-txt-muted/50">-</span> : formatNumber(val)}
                                        </td>
                                    );
                                })}
                                {(config.derivedMeasures || []).map(dm => {
                                    const val = pivotData.rows[rowKey][col]?.[dm.id] || 0;
                                    return (
                                        <td key={`${col}-${dm.id}`} className="p-3 text-center font-black text-purple-300 border-l border-purple-500/20 bg-purple-900/10 tabular-nums">
                                            {formatNumber(val)}
                                        </td>
                                    );
                                })}
                            </>
                        ))}

                        {config.values.map(metric => {
                            const val = pivotData.rows[rowKey]['_total'][metric.id];
                            return (
                                <td key={`total-${metric.id}`} className="p-3 text-center font-bold text-txt-main border-l border-blue-500/20 bg-blue-900/10 group-hover:bg-blue-900/20 tabular-nums">
                                    {formatNumber(val)}
                                </td>
                            );
                        })}
                        {(config.derivedMeasures || []).map(dm => {
                            const val = pivotData.rows[rowKey]['_total'][dm.id];
                            return (
                                <td key={`total-${dm.id}`} className="p-3 text-center font-black text-indigo-300 border-l border-border-subtle bg-indigo-900/10 tabular-nums">
                                    {formatNumber(val)}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-surface-overlay font-bold sticky bottom-0 text-xs z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
                <tr className="border-t border-border-subtle">
                    <td className="p-3 text-txt-main sticky right-0 bg-surface-overlay border-l border-border-subtle z-30">المجموع العام</td>
                    
                    {config.colField !== 'none' && pivotData.sortedColKeys.map(col => (
                        <>
                            {config.values.map(metric => (
                                <td key={`${col}-${metric.id}`} className="p-3 text-center text-txt-main border-l border-border-subtle bg-surface-overlay tabular-nums">
                                    {formatNumber(pivotData.grandTotals[col][metric.id])}
                                </td>
                            ))}
                            {(config.derivedMeasures || []).map(dm => (
                                <td key={`${col}-${dm.id}`} className="p-3 text-center font-black text-purple-300 border-l border-purple-500/20 bg-purple-900/20 tabular-nums">
                                    {formatNumber(pivotData.grandTotals[col][dm.id])}
                                </td>
                            ))}
                        </>
                    ))}

                    {config.values.map(metric => (
                        <td key={`grand-${metric.id}`} className="p-3 text-center text-blue-300 border-l border-blue-500/20 bg-blue-900/30 tabular-nums text-sm">
                            {formatNumber(pivotData.totalOfTotals[metric.id])}
                        </td>
                    ))}
                    {(config.derivedMeasures || []).map(dm => (
                        <td key={`grand-${dm.id}`} className="p-3 text-center font-black text-indigo-300 border-l border-border-subtle bg-indigo-900/30 tabular-nums text-sm">
                            {formatNumber(pivotData.totalOfTotals[dm.id])}
                        </td>
                    ))}
                </tr>
            </tfoot>
        </table>
    </div>
  );
};
