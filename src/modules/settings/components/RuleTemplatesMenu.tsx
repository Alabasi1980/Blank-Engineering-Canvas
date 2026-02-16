
import React, { useState, useRef, useEffect } from 'react';
import { Wand2, ChevronDown } from 'lucide-react';
import { RuleRow } from '../../../types';

interface RuleTemplatesMenuProps {
  onApply: (rules: RuleRow[]) => void;
}

const TEMPLATES: { label: string; rules: Partial<RuleRow>[] }[] = [];

export const RuleTemplatesMenu: React.FC<RuleTemplatesMenuProps> = ({ onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (templateRules: Partial<RuleRow>[]) => {
    const newRules: RuleRow[] = templateRules.map((partial, idx) => ({
      id: crypto.randomUUID(),
      order: idx + 1,
      // Generic structure compliant
      conditions: [],
      balanceType: 'period_balance',
      effectNature: 'add',
      valueBasis: 'system_amount',
      enabled: true,
      ...partial
    } as RuleRow));
    
    onApply(newRules);
    setIsOpen(false);
  };

  if (TEMPLATES.length === 0) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-bold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-2 rounded-lg transition-colors border border-violet-500/30"
      >
        <Wand2 size={14} />
        <span>قوالب جاهزة</span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass-card rounded-xl shadow-2xl border border-border-highlight z-50 overflow-hidden animate-fade-in-down bg-surface-card">
          <div className="p-2 bg-surface-overlay border-b border-border-subtle text-[10px] font-bold text-txt-muted">
            اختر نموذجاً لتطبيقه
          </div>
          <div className="p-1">
            {TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(tmpl.rules)}
                className="w-full text-right px-3 py-2.5 text-xs text-txt-secondary hover:bg-violet-500/10 hover:text-violet-400 rounded-lg transition-colors truncate"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
