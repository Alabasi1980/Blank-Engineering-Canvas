import { DataAdapter, DataQuery, NormalizedTransaction, DataContextValue } from '../types';
import { DataSourceConfigItem } from '../../../types';
import { applyQueryFilters } from '../applyQueryFilters';
// Fix: Replace import from deleted DataIngestionService with ImportService
import { ImportService } from '../../services/ImportService';
import { PersistenceService } from '../../services/PersistenceService';
// Fix: Import from NetworkService as apiUtils was consolidated
import { NetworkService } from '../../services/NetworkService';

export class ApiAdapter implements DataAdapter {
  
  constructor() {}

  async getTransactions(
      query: DataQuery, 
      sourceConfig?: DataSourceConfigItem, 
      context?: DataContextValue
  ): Promise<NormalizedTransaction[]> {
    if (!sourceConfig || sourceConfig.type !== 'api' || !sourceConfig.apiConfig) {
        throw new Error("Invalid API Source Configuration");
    }

    const cacheKey = sourceConfig.id;

    if (!query.forceRefresh) {
        try {
            const cachedData = await PersistenceService.getDataset(cacheKey);
            if (cachedData && cachedData.length > 0) {
                // Return cached data with proper filtering context
                return applyQueryFilters(cachedData, query, context);
            }
        } catch (e) {
            console.warn("Cache lookup failed, falling back to network", e);
        }
    }

    try {
        // Fix: use NetworkService.fetch
        const onlineData = await NetworkService.fetch(sourceConfig.apiConfig);
        
        // Fix: use ImportService.normalize instead of deleted DataIngestionService
        const normalizedData = ImportService.normalize(
            onlineData, 
            sourceConfig.mapping || {} 
        );

        if (normalizedData.length > 0) {
            await PersistenceService.saveDataset(cacheKey, normalizedData);
            return applyQueryFilters(normalizedData, query, context);
        } else {
            console.warn("API Data Invalid or empty");
            throw new Error("API returned no valid data.");
        }

    } catch (apiError) {
        if (query.forceRefresh) {
             const cachedData = await PersistenceService.getDataset(cacheKey);
             if (cachedData && cachedData.length > 0) {
                 console.warn("Network failed, serving stale cache.");
                 return applyQueryFilters(cachedData, query, context);
             }
        }
        throw apiError;
    }
  }
}