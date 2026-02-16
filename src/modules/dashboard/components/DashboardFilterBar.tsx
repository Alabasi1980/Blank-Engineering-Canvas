
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Filter, ChevronDown, X, RotateCcw, Tag, Database, Calendar, Hash, AlignLeft, FileText, List } from 'lucide-react';
import { useDashboardFilters } from '../../../core/context/DashboardFiltersContext';
import { useCompany } from '../../../context/CompanyContext';
import { MultiSelect } from '../../../shared/components/MultiSelect';
import { useLabelResolver } from '../../../hooks/useLabelResolver';
import { DimensionDefinition } from '../../../types';
import { MASTER_ICONS } from '../../../constants';

interface DashboardFilterBarProps {
  filterOptions: Record<string, string[]>;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({ filterOptions }) => {
  const { config } = useCompany();
  const { filters, setFilters, resetFilters } = useDashboardFilters();
  const { resolveLabel } = useLabelResolver();
  
  const [activeDropdown, setActiveDropdown] = useState<'filters' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeDimensions = useMemo(() => {
      return (config.dimensionsRegistry || []).filter(d => d.enabled && d.ui.filter);
  }, [config.dimensionsRegistry]);

  const activeAttributesCount = useMemo(() => {
      let count = 0;
      Object.keys(filters).forEach(key => {
          if (key === 'dateFrom' || key === 'dateTo') return;
          if (Array.isArray(filters[key])) count += filters[key].length;
      });
      return count;
  }, [filters]);

  const clearAttributes = () => {
      resetFilters();
  };

  const getDimensionIcon = (dim: DimensionDefinition) => {
      if (dim.type === 'master_data') {
          const entity = config.masterEntities?.find(e => e.id === (dim.sourceEntityId || dim.id));
          if (entity && entity.icon && MASTER_ICONS[entity.icon]) {
              return MASTER_ICONS[entity.icon];
          }
          return Database;
      }
      
      if (dim.id === 'date') return Calendar;
      if (dim.id === 'amount') return Hash;
      if (dim.id === 'description') return AlignLeft;
      if (dim.id === 'sourceRef') return FileText;

      switch (dim.type) {
          case 'number': return Hash;
          case 'date': return Calendar;
          case 'list': return List;
          default: return Tag;
      }
  };

  const renderFilterControl = (dim: DimensionDefinition) => {
      const rawOptions = filterOptions[dim.id] || [];
      const options = rawOptions.map(val => ({
          value: val,
          label: resolveLabel(dim.id, val)
      }));

      const Icon = getDimensionIcon(dim);

      return (
          <FilterGroup 
            key={dim.id} 
            label={dim.label} 
            icon={Icon} 
            onClear={() => setFilters({ [dim.id]: [] })}
          >
              <MultiSelect 
                  label="" 
                  placeholder={`الكل (${options.length})`}
                  options={options} 
                  selectedValues={filters[dim.id] || []} 
                  onChange={(vals) => setFilters({ [dim.id]: vals })} 
              />
          </FilterGroup>
      );
  };

  return (
    <div className="bg-surface-overlay/50 backdrop-blur-md border-b border-border-subtle px-6 py-2.5 flex items-center gap-3 relative z-20 shadow-sm no-print" ref={dropdownRef}>
          <div className="flex items-center gap-2 text-txt-muted text-[10px] font-black uppercase tracking-widest ml-2 pl-2 border-l border-border-subtle">
              <Filter size={14} />
              <span>تصفية:</span>
          </div>
          
          <div className="relative">
              <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'filters' ? null : 'filters')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeAttributesCount > 0
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-surface-card border-border-subtle text-txt-secondary hover:bg-surface-input'
                  }`}
              >
                  <span>معايير العرض</span>
                  {activeAttributesCount > 0 && (
                      <span className="bg-white text-blue-600 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black">
                          {activeAttributesCount}
                      </span>
                  )}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'filters' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'filters' && (
                  <div className="absolute top-full right-0 mt-3 w-[500px] glass-card shadow-2xl p-0 z-50 animate-fade-in-up overflow-hidden border border-border-subtle bg-surface-card">
                      <div className="bg-surface-overlay px-6 py-4 flex justify-between items-center text-txt-main border-b border-border-subtle">
                          <div className="flex items-center gap-3">
                              <Filter size={18} className="text-blue-400" />
                              <h4 className="text-sm font-black tracking-tight">تخصيص الفلاتر المتقدمة</h4>
                          </div>
                          {activeAttributesCount > 0 && (
                            <button onClick={clearAttributes} className="text-[10px] font-bold bg-surface-input hover:bg-surface-overlay px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-txt-secondary">
                                <RotateCcw size={12}/> مسح الكل
                            </button>
                          )}
                      </div>
                      
                      <div className="p-6 grid grid-cols-1 gap-6 max-h-[500px] overflow-y-auto custom-scrollbar bg-surface-app/50">
                          {activeDimensions.length === 0 && (
                              <div className="text-center py-8 text-txt-muted text-xs">لا توجد فلاتر مفعلة في النظام</div>
                          )}
                          {activeDimensions.map(dim => renderFilterControl(dim))}
                      </div>

                      <div className="bg-surface-overlay p-4 border-t border-border-subtle flex justify-end">
                          <button onClick={() => setActiveDropdown(null)} className="bg-blue-600 text-white text-xs font-black px-8 py-3 rounded-2xl hover:bg-blue-500 transition-all shadow-md active:scale-95">تطبيق الفلاتر</button>
                      </div>
                  </div>
              )}
          </div>
          
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {activeDimensions.map(dim => {
                  const selectedValues = filters[dim.id];
                  if (!Array.isArray(selectedValues) || selectedValues.length === 0) return null;

                  return selectedValues.map(val => (
                      <div key={`${dim.id}-${val}`} className="flex items-center gap-1.5 bg-blue-500/10 text-blue-300 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-blue-500/20 whitespace-nowrap animate-fade-in group">
                          <span className="opacity-50 font-normal">{dim.label}:</span>
                          <span>{resolveLabel(dim.id, val)}</span>
                          <button 
                            onClick={() => setFilters({ [dim.id]: selectedValues.filter(x => x !== val) })} 
                            className="text-blue-400 hover:text-red-400 transition-colors"
                          >
                              <X size={12}/>
                          </button>
                      </div>
                  ));
              })}
          </div>
    </div>
  );
};

const FilterGroup = ({ label, icon: Icon, children, onClear }: any) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                <Icon size={12} />
                <span>{label}</span>
            </div>
            <button onClick={onClear} className="text-[9px] font-bold text-txt-muted hover:text-red-400 transition-colors">مسح</button>
        </div>
        {children}
    </div>
);
