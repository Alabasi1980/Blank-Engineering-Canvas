
import React, { useState, useEffect } from 'react';
import { Calculator, ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, ShieldAlert, Info, Zap } from 'lucide-react';
import { SubCard, AlertRule } from '../../types';
import { CARD_COLORS } from '../../constants';
import { Sparkline } from '../Sparkline';
import { useFormatters } from '../../hooks/useFormatters';

interface DashboardWidgetCardProps {
  card: SubCard;
  metrics: {
    currentValue: number;
    prevValue: number;
    yoyValue: number;
    percentChange: number;
    trendData: number[];
    annualValue: number;
    cumulativeValue: number;
    activeAlerts: AlertRule[];
  };
  unit: string;
  onClick: () => void;
}

const useCountUp = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const start = 0; 
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(start + (end - start) * ease);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

export const DashboardWidgetCard: React.FC<DashboardWidgetCardProps> = React.memo(({ 
  card, 
  metrics, 
  unit, 
  onClick 
}) => {
  const { formatNumber } = useFormatters();
  const isCountType = card.dataType === 'integer_count';
  
  // Map standard themes to our neon palette
  const themeColors: any = {
      blue: { text: 'text-blue-400', bg: 'bg-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', border: 'border-blue-500/30' },
      emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', border: 'border-emerald-500/30' },
      violet: { text: 'text-violet-400', bg: 'bg-violet-500', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]', border: 'border-violet-500/30' },
      amber: { text: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', border: 'border-amber-500/30' },
      rose: { text: 'text-rose-400', bg: 'bg-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]', border: 'border-rose-500/30' },
      slate: { text: 'text-slate-400', bg: 'bg-slate-500', glow: 'shadow-[0_0_20px_rgba(100,116,139,0.3)]', border: 'border-slate-500/30' },
  };

  const theme = themeColors[card.color || 'blue'] || themeColors.blue;
  const themeColorHex = { blue: '#3b82f6', emerald: '#10b981', violet: '#8b5cf6', amber: '#f59e0b', rose: '#f43f5e', slate: '#64748b' }[card.color || 'blue'];

  const animatedValue = useCountUp(metrics.currentValue);
  const displayTotal = formatNumber(animatedValue);
  
  const isPositiveTrend = metrics.percentChange > 0;
  const isNeutralTrend = metrics.percentChange === 0;
  const yoyGrowth = metrics.yoyValue !== 0 ? ((metrics.currentValue - metrics.yoyValue) / Math.abs(metrics.yoyValue)) * 100 : 0;

  const activeAlert = metrics.activeAlerts.find(a => a.severity === 'danger') || metrics.activeAlerts[0];

  return (
    <div 
        onClick={onClick}
        className={`glass-card group relative p-6 cursor-pointer flex flex-col h-full min-h-[180px] hover:border-opacity-50 bg-surface-card transition-all duration-300 ${activeAlert ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : theme.border}`}
    >
      {/* Top Glow Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${card.color}-500 to-transparent opacity-50`}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1 min-w-0 pr-2">
            <h4 className="font-black text-txt-secondary text-[11px] leading-tight uppercase tracking-[0.1em] mb-1 truncate group-hover:text-txt-main transition-colors" title={card.title}>
                {card.title}
            </h4>
            {activeAlert && (
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-400 animate-pulse mt-1">
                    <AlertTriangle size={12} /> {activeAlert.label}
                </div>
            )}
        </div>
        <div className={`p-2.5 rounded-xl bg-surface-input border border-border-subtle ${theme.text} ${theme.glow} transition-transform group-hover:scale-110 group-hover:bg-surface-overlay`}>
            {isCountType ? <Calculator size={18} /> : <span className="text-[10px] font-black">{unit}</span>}
        </div>
      </div>

      {/* Main Number */}
      <div className="flex items-baseline gap-2 mb-2 relative z-10">
        <div className={`text-4xl font-black tracking-tight tabular-nums text-txt-main ${activeAlert?.severity === 'danger' ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : ''}`}>
          {displayTotal}
        </div>
      </div>

      {/* Trends */}
      <div className="flex items-center gap-3 mb-6 relative z-10 h-6">
        {!isNeutralTrend ? (
            <div className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border backdrop-blur-md ${isPositiveTrend ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                {isPositiveTrend ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                <span>{Math.abs(metrics.percentChange).toFixed(1)}%</span>
            </div>
        ) : (
            <div className="text-[10px] text-txt-muted font-bold bg-surface-input px-2 py-1 rounded-lg border border-border-subtle">ثبات 0%</div>
        )}
        
        {metrics.yoyValue !== 0 && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20" title="نمو سنوي">
                <Zap size={10} /> YoY {yoyGrowth > 0 ? '+' : ''}{yoyGrowth.toFixed(0)}%
            </div>
        )}
      </div>

      {/* Sparkline (Floating) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
        <Sparkline data={metrics.trendData} color={themeColorHex} height={80} />
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 gap-px bg-surface-input border-t border-border-subtle rounded-b-lg overflow-hidden mt-auto mx-[-24px] mb-[-24px] backdrop-blur-md relative z-10">
        {card.showAnnualCumulative && (
            <div className="p-3 flex flex-col items-center justify-center hover:bg-surface-overlay transition-colors group/stat">
                <span className="text-[9px] font-black text-txt-muted uppercase mb-0.5 group-hover/stat:text-txt-main transition-colors">الدورة الحالية</span>
                <span className="font-bold text-txt-secondary tabular-nums text-xs">{formatNumber(metrics.annualValue)}</span>
            </div>
        )}
        {card.showCumulativeTotal && (
            <div className="p-3 flex flex-col items-center justify-center hover:bg-surface-overlay transition-colors border-r border-border-subtle group/stat">
                <span className="text-[9px] font-black text-txt-muted uppercase mb-0.5 group-hover/stat:text-txt-main transition-colors">التراكمي الكلي</span>
                <span className="font-bold text-txt-secondary tabular-nums text-xs">{formatNumber(metrics.cumulativeValue)}</span>
            </div>
        )}
      </div>
    </div>
  );
});
