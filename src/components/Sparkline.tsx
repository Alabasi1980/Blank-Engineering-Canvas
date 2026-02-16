
import React, { useState, useMemo, useId } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  formatter?: (val: number) => string;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  color = '#3b82f6', 
  width = 200, 
  height = 40,
  formatter = (val) => val.toString()
}) => {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 1. Handle insufficient data
  if (!data || data.length < 2) return null;

  // 2. Calculations
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  // Logic to handle flat-line (when max === min) to center the line
  const paddingY = 5;
  const usableHeight = height - (paddingY * 2);

  const getCoordinates = (index: number) => {
    const x = (index / (data.length - 1)) * width;
    
    let y;
    if (range === 0) {
        y = height / 2; // Center if flat
    } else {
        y = height - paddingY - ((data[index] - min) / range) * usableHeight;
    }
    return { x, y };
  };

  const points = data.map((_, i) => {
    const { x, y } = getCoordinates(i);
    return `${x},${y}`;
  }).join(' ');

  const fillPath = `M 0,${height} L ${points} L ${width},${height} Z`;

  // 3. Interaction Handlers
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Find closest index based on mouse X
    const index = Math.round((mouseX / rect.width) * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    
    setHoverIndex(clampedIndex);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // 4. Active Point Data
  const activePoint = hoverIndex !== null ? getCoordinates(hoverIndex) : null;
  const activeValue = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        className="overflow-visible touch-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area Fill */}
      <path d={fillPath} fill={`url(#${gradientId})`} stroke="none" />
      
      {/* Line Stroke */}
      <path 
        d={`M ${points}`} 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Interactive Elements */}
      {hoverIndex !== null && activePoint && activeValue !== null && (
        <g>
            {/* Vertical Cursor Line */}
            <line 
                x1={activePoint.x} 
                y1={0} 
                x2={activePoint.x} 
                y2={height} 
                stroke={color} 
                strokeWidth="1" 
                strokeDasharray="4 2" 
                opacity="0.5" 
            />

            {/* Point Dot */}
            <circle 
                cx={activePoint.x} 
                cy={activePoint.y} 
                r="3" 
                fill="white" 
                stroke={color} 
                strokeWidth="2" 
            />
            
            {/* Tooltip Background (Adjust position if near edges) */}
            <g transform={`translate(${Math.min(Math.max(activePoint.x - 30, 0), width - 60)}, -10)`}>
                <rect 
                    x="0" 
                    y="0" 
                    width="60" 
                    height="20" 
                    rx="4" 
                    fill="var(--surface-sidebar)" 
                    opacity="0.9" 
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                />
                {/* Tooltip Text */}
                <text 
                    x="30" 
                    y="14" 
                    textAnchor="middle" 
                    fill="var(--text-main)" 
                    fontSize="10" 
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                >
                    {formatter(activeValue)}
                </text>
            </g>
        </g>
      )}

      {/* Default End Dot (Only show if not hovering) */}
      {hoverIndex === null && (
         <circle 
            cx={getCoordinates(data.length - 1).x} 
            cy={getCoordinates(data.length - 1).y} 
            r="2" 
            fill={color} 
            className="animate-pulse"
        />
      )}
    </svg>
  );
};
