
import React, { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction, PivotConfig } from '../types';
import { usePivotCalculations } from './pivot/usePivotCalculations';
import { PivotControls } from './pivot/PivotControls';
import { PivotTableView } from './pivot/PivotTableView';

interface PivotTableProps {
  data: { transaction: Transaction, effect: 'add' | 'subtract' | 'neutral', calculatedValue: number }[];
  config: PivotConfig;
  onConfigChange: (config: PivotConfig) => void;
}

export const PivotTable: React.FC<PivotTableProps> = ({ data, config, onConfigChange }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  
  // Logic Engine
  const pivotData = usePivotCalculations({ data, config });

  return (
    <div className="flex flex-col h-full bg-transparent font-sans">
      
      {/* --- CONFIGURATION PANEL TOGGLE & CONTENT --- */}
      <div className="bg-surface-card border-b border-border-subtle z-30 shadow-sm relative">
         <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="w-full flex justify-between items-center px-6 py-3 text-xs font-bold text-txt-secondary hover:bg-surface-overlay transition-colors"
         >
            <div className="flex items-center gap-2 text-primary-400">
                <Settings2 size={16} />
                <span>إعدادات الجدول وتوزيع البيانات</span>
            </div>
            <div className="flex items-center gap-2 text-txt-muted">
                <span>{isConfigOpen ? 'إخفاء الإعدادات' : 'إظهار الإعدادات'}</span>
                {isConfigOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
         </button>
         
         {isConfigOpen && (
             <PivotControls config={config} onConfigChange={onConfigChange} />
         )}
      </div>

      {/* --- THE TABLE VIEW --- */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-surface-app/50 p-4">
          <PivotTableView 
            pivotData={pivotData} 
            config={config} 
            hasData={data.length > 0} 
          />
      </div>
    </div>
  );
};
