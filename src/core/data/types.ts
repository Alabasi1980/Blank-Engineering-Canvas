
import { Transaction, CompanyConfig } from '../../types';

// Re-export or alias the transaction type for normalization
export type NormalizedTransaction = Transaction;

export interface DataQuery {
  dataSourceId?: string; 
  dateFrom?: string; // ISO Date String YYYY-MM-DD
  dateTo?: string;   // ISO Date String YYYY-MM-DD
  // Dynamic filters matching DashboardFilters interface
  filters?: {
      [key: string]: any; 
  };
  forceRefresh?: boolean; // New flag to bypass cache
}

export interface DataContextValue {
    config: CompanyConfig;
    masterData: Record<string, any[]>;
}

export interface DataAdapter {
  getTransactions(query: DataQuery, sourceConfig?: any, context?: DataContextValue): Promise<NormalizedTransaction[]>;
}
