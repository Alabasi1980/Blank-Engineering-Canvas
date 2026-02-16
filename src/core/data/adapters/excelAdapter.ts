
import { DataAdapter, DataQuery, NormalizedTransaction } from '../types';
import { applyQueryFilters } from '../applyQueryFilters';

export class ExcelAdapter implements DataAdapter {
  private datasets: Record<string, NormalizedTransaction[]> = {};
  private defaultSourceId: string = 'mock_default';
  
  constructor(
      datasets: Record<string, NormalizedTransaction[]> = {}, 
      defaultSourceId: string = 'mock_default'
    ) {
    this.datasets = datasets;
    this.defaultSourceId = defaultSourceId;
  }

  updateDatasets(
      datasets: Record<string, NormalizedTransaction[]>, 
      defaultSourceId: string
    ) {
      this.datasets = datasets;
      this.defaultSourceId = defaultSourceId;
  }
  
  // Update signature to accept optional context
  async getTransactions(query: DataQuery, sourceConfig?: any, context?: any): Promise<NormalizedTransaction[]> {
    // 1. Determine Source ID
    const targetSourceId = query.dataSourceId || this.defaultSourceId;
    
    // 2. Retrieve Data (In-Memory)
    const data = this.datasets[targetSourceId] || [];

    // 3. Apply Shared Filter Logic with Context (for Hierarchy matching)
    return applyQueryFilters(data, query, context);
  }
}
