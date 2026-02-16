
import React, { useMemo } from 'react';

// --- Types ---
interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  id?: string; // Optional ID for identification
}

interface ChartProps {
  data: ChartDataPoint[];
  height?: number;
  className?: string;
  valueFormatter?: (val: number) => string;
  onItemClick?: (item: ChartDataPoint) => void; // New interaction prop
  selectedLabel?: string | null; // For highlighting selected item
}

// --- Colors ---
const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

// --- Bar Chart Component ---
export const SimpleBarChart: React.FC<ChartProps> = ({ 
  data, 
  height = 200, 
  className = '',
  valueFormatter = (v) => v.toLocaleString(),
  onItemClick,
  selectedLabel
}) => {
  const maxVal = Math.max(...data.map(d => d.value), 0);
  const chartHeight = height - 40; // reserve space for labels

  if (maxVal === 0) return <div className="text-center text-txt-muted py-10 text-xs font-bold opacity-50">لا توجد بيانات للعرض</div>;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end gap-2 h-full" style={{ height: `${height}px` }}>
        {data.map((point, idx) => {
          const barHeight = (point.value / maxVal) * chartHeight;
          const color = point.color || CHART_COLORS[idx % CHART_COLORS.length];
          const isSelected = selectedLabel === point.label;
          const isDimmed = selectedLabel && !isSelected;
          
          return (
            <div 
                key={idx} 
                className={`flex-1 flex flex-col justify-end group relative min-w-[20px] transition-all duration-300 ${onItemClick ? 'cursor-pointer' : ''} ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}`}
                onClick={() => onItemClick && onItemClick(point)}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-surface-sidebar border border-border-subtle text-txt-main text-xs rounded-xl py-2 px-3 whitespace-nowrap shadow-xl pointer-events-none backdrop-blur-md">
                <div className="font-bold mb-0.5">{point.label}</div>
                <div className="font-mono text-primary-400">{valueFormatter(point.value)}</div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle"></div>
              </div>

              {/* Bar */}
              <div 
                className={`w-full rounded-t-sm transition-all duration-500 ${!selectedLabel ? 'hover:opacity-80' : ''} ${isSelected ? 'ring-2 ring-white/20' : ''}`}
                style={{ 
                    height: `${Math.max(barHeight, 4)}px`, 
                    backgroundColor: color 
                }}
              ></div>
              
              {/* Label */}
              <div className={`mt-2 text-[10px] truncate text-center font-medium transition-colors ${isSelected ? 'text-primary-400 font-bold' : 'text-txt-muted'}`} title={point.label}>
                {point.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Donut Chart Component ---
export const SimpleDonutChart: React.FC<ChartProps> = ({ 
    data, 
    height = 200, 
    className = '',
    valueFormatter = (v) => v.toLocaleString(),
    onItemClick,
    selectedLabel
}) => {
    const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
    
    // Calculate segments
    let cumulativePercent = 0;
    
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    if (total === 0) return <div className="text-center text-txt-muted py-10 text-xs font-bold opacity-50">لا توجد بيانات للعرض</div>;

    return (
        <div className={`flex items-center gap-8 ${className}`}>
            {/* Chart SVG */}
            <div className="relative shrink-0" style={{ width: height, height: height }}>
                <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full overflow-visible">
                    {data.map((slice, idx) => {
                        if (slice.value === 0) return null;
                        
                        const startPercent = cumulativePercent;
                        const slicePercent = slice.value / total;
                        cumulativePercent += slicePercent;
                        const endPercent = cumulativePercent;

                        const [startX, startY] = getCoordinatesForPercent(startPercent);
                        const [endX, endY] = getCoordinatesForPercent(endPercent);
                        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
                        
                        const color = slice.color || CHART_COLORS[idx % CHART_COLORS.length];
                        const isSelected = selectedLabel === slice.label;
                        const isDimmed = selectedLabel && !isSelected;

                        // Handle single item case (full circle)
                        if (data.length === 1 || slicePercent === 1) {
                            return (
                                <circle 
                                    key={idx} 
                                    cx="0" 
                                    cy="0" 
                                    r="0.8" 
                                    fill="none" 
                                    stroke={color} 
                                    strokeWidth="0.3"
                                    onClick={() => onItemClick && onItemClick(slice)}
                                    className={onItemClick ? 'cursor-pointer' : ''} 
                                />
                            );
                        }

                        const pathData = [
                            `M ${startX} ${startY}`, // Move
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
                            `L 0 0`, // Line to center
                        ].join(' ');

                        return (
                            <path 
                                key={idx} 
                                d={pathData} 
                                fill={color} 
                                stroke="transparent" // Removed white stroke to avoid artifacts in dark mode
                                strokeWidth="0.02"
                                className={`transition-all duration-300 ${onItemClick ? 'cursor-pointer' : ''} ${isDimmed ? 'opacity-30' : 'hover:opacity-90'} ${isSelected ? 'stroke-[0.05] stroke-primary-400' : ''}`}
                                onClick={() => onItemClick && onItemClick(slice)}
                                style={{ transform: isSelected ? 'scale(1.05)' : 'scale(1)' }}
                            >
                                <title>{`${slice.label}: ${valueFormatter(slice.value)} (${(slicePercent * 100).toFixed(1)}%)`}</title>
                            </path>
                        );
                    })}
                    {/* Donut Hole */}
                    <circle cx="0" cy="0" r="0.6" className="fill-surface-card" />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-txt-muted font-bold uppercase tracking-widest">الإجمالي</span>
                    <span className="text-sm font-black text-txt-main tabular-nums">{valueFormatter(total)}</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                    {data.map((slice, idx) => {
                        const percent = (slice.value / total) * 100;
                        const color = slice.color || CHART_COLORS[idx % CHART_COLORS.length];
                        const isSelected = selectedLabel === slice.label;
                        const isDimmed = selectedLabel && !isSelected;

                        return (
                            <div 
                                key={idx} 
                                className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors ${onItemClick ? 'cursor-pointer hover:bg-surface-overlay' : ''} ${isSelected ? 'bg-primary-500/10 ring-1 ring-primary-500/20' : ''} ${isDimmed ? 'opacity-40' : ''}`}
                                onClick={() => onItemClick && onItemClick(slice)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                                    <span className={`truncate font-medium ${isSelected ? 'text-primary-400 font-bold' : 'text-txt-secondary'}`} title={slice.label}>{slice.label}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-bold text-txt-main tabular-nums">{valueFormatter(slice.value)}</span>
                                    <span className="text-[10px] text-txt-muted w-8 text-left font-mono">({percent.toFixed(1)}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
