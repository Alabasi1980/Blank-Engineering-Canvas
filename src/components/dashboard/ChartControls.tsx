
import React, { useMemo } from 'react';
import { BarChart3, PieChart, Layers, Hash, DollarSign, ArrowLeftRight } from 'lucide-react';
import { ChartConfig, PivotField } from '../../types';
import { useCompany } from '../../context/CompanyContext';

interface ChartControlsProps {
  config: ChartConfig;
  onChange: (newConfig: ChartConfig) => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({ config, onChange }) => {
  const { config: companyConfig } = useCompany();

  // Dynamically generate chart dimension options from the registry
  const dimensionOptions = useMemo(() => {
      return (companyConfig.dimensionsRegistry || [])
          .filter(d => d.enabled && d.ui.pivot)
          .map(d => ({ value: d.id, label: d.label }));
  }, [companyConfig.dimensionsRegistry]);
  
  const updateType = (type: ChartConfig['type']) => onChange({ ...config, type });
  const updateDimension = (dimension: PivotField) => onChange({ ...config, dimension });
  const updateMeasure = (measure: ChartConfig['measure']) => onChange({ ...config, measure });

  return (
    <div className="bg-surface-card border-b border-border-subtle p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Dimension & Measure */}
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            
            {/* Dimension Selector */}
            <div className="flex items-center gap-2 bg-surface-input p-1 rounded-lg shrink-0 border border-border-subtle">
                <div className="px-2 text-txt-muted">
                    <Layers size={16} />
                </div>
                <select 
                    value={config.dimension}
                    onChange={(e) => updateDimension(e.target.value as PivotField)}
                    className="bg-transparent text-sm font-bold text-txt-main outline-none cursor-pointer py-1"
                >
                    {dimensionOptions.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>

            <ArrowLeftRight size={16} className="text-txt-muted/50 shrink-0" />

            {/* Measure Selector */}
            <div className="flex items-center gap-1 bg-surface-input p-1 rounded-lg shrink-0 border border-border-subtle">
                <button
                    onClick={() => updateMeasure('amount')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        config.measure === 'amount' ? 'bg-surface-card text-primary-400 shadow-sm border border-primary-500/20' : 'text-txt-muted hover:text-txt-main'
                    }`}
                >
                    <DollarSign size={14} />
                    <span>القيمة</span>
                </button>
                <button
                    onClick={() => updateMeasure('count')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        config.measure === 'count' ? 'bg-surface-card text-primary-400 shadow-sm border border-primary-500/20' : 'text-txt-muted hover:text-txt-main'
                    }`}
                >
                    <Hash size={14} />
                    <span>العدد</span>
                </button>
            </div>

        </div>

        {/* Right: Chart Type */}
        <div className="flex items-center gap-2 bg-surface-input p-1 rounded-lg shrink-0 border border-border-subtle">
            <button
                onClick={() => updateType('donut')}
                className={`p-2 rounded-md transition-all ${
                    config.type === 'donut' ? 'bg-surface-card text-primary-400 shadow-sm border border-primary-500/20' : 'text-txt-muted hover:text-txt-main'
                }`}
                title="رسم دائري (Donut)"
            >
                <PieChart size={18} />
            </button>
            <button
                onClick={() => updateType('bar')}
                className={`p-2 rounded-md transition-all ${
                    config.type === 'bar' ? 'bg-surface-card text-primary-400 shadow-sm border border-primary-500/20' : 'text-txt-muted hover:text-txt-main'
                }`}
                title="أعمدة بيانية (Bar)"
            >
                <BarChart3 size={18} />
            </button>
        </div>

      </div>
    </div>
  );
};
