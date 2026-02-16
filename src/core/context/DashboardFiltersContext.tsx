import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { PersistenceService } from '../services/PersistenceService';

export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  // Dynamic filters: keys correspond to Dimension IDs, values are arrays of selected IDs
  [key: string]: any; 
}

interface DashboardFiltersContextType {
  filters: DashboardFilters;
  filtersHash: string; // Fast comparison key
  setFilters: (filters: Partial<DashboardFilters>) => void;
  replaceFilters: (filters: DashboardFilters) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const STORAGE_KEY = 'dashboard_filters_state_v2';

const DashboardFiltersContext = createContext<DashboardFiltersContextType | undefined>(undefined);

export const DashboardFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial from storage using Persistence Layer
  const [filters, setFiltersState] = useState<DashboardFilters>(() => {
      return PersistenceService.get(STORAGE_KEY, {});
  });

  const setFilters = (updates: Partial<DashboardFilters>) => {
    setFiltersState(prev => {
        const next = { ...prev, ...updates };
        // Clean up empty arrays or nulls to keep state clean
        Object.keys(next).forEach(key => {
            if (Array.isArray(next[key]) && next[key].length === 0) {
                delete next[key];
            }
            if (next[key] === undefined || next[key] === null) {
                delete next[key];
            }
        });
        PersistenceService.set(STORAGE_KEY, next);
        return next;
    });
  };

  const replaceFilters = (newFilters: DashboardFilters) => {
      setFiltersState(newFilters);
      PersistenceService.set(STORAGE_KEY, newFilters);
  };

  const resetFilters = () => {
    // Keep dates, reset attributes
    setFiltersState(prev => {
        const next: DashboardFilters = {};
        if (prev.dateFrom) next.dateFrom = prev.dateFrom;
        if (prev.dateTo) next.dateTo = prev.dateTo;
        PersistenceService.set(STORAGE_KEY, next);
        return next;
    });
  };

  // Generate a stable hash for filters to be used in useMemo dependencies
  const filtersHash = useMemo(() => {
      const keys = Object.keys(filters).sort();
      return keys.map(k => `${k}:${JSON.stringify(filters[k])}`).join('|');
  }, [filters]);

  const activeFilterCount = Object.entries(filters).reduce((acc, [key, val]) => {
      if (key === 'dateFrom' || key === 'dateTo') return acc;
      if (Array.isArray(val) && val.length > 0) return acc + 1;
      if (typeof val === 'string' && val.trim() !== '') return acc + 1;
      return acc;
  }, 0);

  return (
    <DashboardFiltersContext.Provider value={{ filters, filtersHash, setFilters, replaceFilters, resetFilters, activeFilterCount }}>
      {children}
    </DashboardFiltersContext.Provider>
  );
};

export const useDashboardFilters = () => {
  const context = useContext(DashboardFiltersContext);
  if (context === undefined) {
    throw new Error('useDashboardFilters must be used within a DashboardFiltersProvider');
  }
  return context;
};