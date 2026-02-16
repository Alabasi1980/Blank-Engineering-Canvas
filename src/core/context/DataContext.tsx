
import React, { createContext, useContext, ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { DataAdapter, NormalizedTransaction, DataQuery } from '../data/types';
import { ExcelAdapter } from '../data/adapters/excelAdapter';
import { ApiAdapter } from '../data/adapters/apiAdapter'; 
import { useCompany } from '../../context/CompanyContext';
import { useMasterDataStore } from '../../context/MasterDataStoreContext';
import { PersistenceService } from '../services/PersistenceService';
import { useUI } from '../../context/UIContext';
import { ImportService } from '../services/ImportService';
import { UpdateStrategy, ImportBatch, Transaction } from '../../types';
import { LocalFileSystemService } from '../services/LocalFileSystemService';
import { SchemaService } from '../services/SchemaService';
import { useAuth } from '../../context/AuthContext';

interface DataContextType {
  dataAdapter: DataAdapter;
  datasets: Record<string, NormalizedTransaction[]>;
  saveDataset: (sourceId: string, data: NormalizedTransaction[], strategy?: UpdateStrategy, primaryKey?: string | string[]) => Promise<Transaction[]>;
  deleteDataset: (sourceId: string) => Promise<void>;
  deleteTransaction: (sourceId: string, transactionId: string) => Promise<void>;
  deleteBatch: (sourceId: string, batchId: string) => Promise<void>;
  getFilterOptions: (dataSourceIds?: string[]) => Record<string, string[]>;
  syncDataSource: (sourceId: string) => Promise<void>;
  isLoadingData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config, updateConfig } = useCompany();
  const { allMasterData } = useMasterDataStore(); 
  const { activeGroup } = useAuth();
  const { setGlobalLoading, showToast } = useUI();
  
  const [datasets, setDatasets] = useState<Record<string, NormalizedTransaction[]>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const excelAdapterRef = useRef<ExcelAdapter | null>(null);
  const apiAdapterRef = useRef<ApiAdapter | null>(null);
  
  if (!excelAdapterRef.current) excelAdapterRef.current = new ExcelAdapter({}, config.defaultDataSourceId || '');
  if (!apiAdapterRef.current) apiAdapterRef.current = new ApiAdapter();

  useEffect(() => {
    const loadFromStorage = async () => {
        setIsLoadingData(true);
        try {
            const loadedDatasets = await PersistenceService.getAllDatasets();
            setDatasets(loadedDatasets);
        } catch (e) { 
            console.error("Failed to load persistence layer", e); 
        } finally {
            setIsLoadingData(false);
        }
    };
    loadFromStorage();
  }, []);

  useEffect(() => {
      if (excelAdapterRef.current) {
          excelAdapterRef.current.updateDatasets(datasets, config.defaultDataSourceId || '');
      }
  }, [datasets, config.defaultDataSourceId]);

  const saveDataset = async (sourceId: string, newData: NormalizedTransaction[], strategy: UpdateStrategy = 'replace_all', primaryKey?: string | string[]): Promise<Transaction[]> => {
      setGlobalLoading(true, 'جاري معالجة مصفوفة البيانات...');
      try {
          const existingData = datasets[sourceId] || [];
          const result = ImportService.merge(existingData, newData, strategy, primaryKey);
          
          setDatasets(prev => ({ ...prev, [sourceId]: result.finalData }));
          await PersistenceService.saveDataset(sourceId, result.finalData);
          await LocalFileSystemService.sync(`${sourceId}.json`, result.finalData, 'transactions');
          
          return result.overwrittenRecords;
      } catch (e) {
          console.error("Critical: Failed to persist dataset", e);
          throw e;
      } finally {
          setGlobalLoading(false);
      }
  };

  const deleteDataset = async (sourceId: string) => {
      setGlobalLoading(true, 'جاري تنظيف المستودع...');
      try {
          const newDatasets = { ...datasets };
          delete newDatasets[sourceId];
          setDatasets(newDatasets);
          await PersistenceService.deleteDataset(sourceId);
          await LocalFileSystemService.sync(`${sourceId}.json`, null, 'transactions'); 
      } finally {
          setGlobalLoading(false);
      }
  };

  const deleteTransaction = async (sourceId: string, transactionId: string) => {
      const currentData = datasets[sourceId];
      if (!currentData) return;

      const newData = currentData.filter(tx => tx.id !== transactionId);
      setDatasets(prev => ({ ...prev, [sourceId]: newData }));
      await PersistenceService.saveDataset(sourceId, newData);
      await LocalFileSystemService.sync(`${sourceId}.json`, newData, 'transactions');
      showToast('تم حذف السجل بنجاح');
  };

  const deleteBatch = async (sourceId: string, batchId: string) => {
      const currentData = datasets[sourceId];
      if (!currentData) return;

      const source = config.dataSources.find(s => s.id === sourceId);
      if (!source) return;

      const batchToUndo = (source.importHistory || []).find(b => b.id === batchId);
      if (!batchToUndo) return;

      setGlobalLoading(true, `جاري التراجع الذكي عن الحزمة ${batchId}...`);
      try {
          let newData = currentData.filter(tx => tx.batchId !== batchId);
          if (batchToUndo.overwrittenBackup && batchToUndo.overwrittenBackup.length > 0) {
              const backupIds = new Set(batchToUndo.overwrittenBackup.map(tx => tx.id));
              newData = newData.filter(tx => !backupIds.has(tx.id));
              newData = [...newData, ...batchToUndo.overwrittenBackup];
          }

          setDatasets(prev => ({ ...prev, [sourceId]: newData }));
          await PersistenceService.saveDataset(sourceId, newData);
          await LocalFileSystemService.sync(`${sourceId}.json`, newData, 'transactions');

          const newHistory = (source.importHistory || []).filter(b => b.id !== batchId);
          updateConfig({
              dataSources: config.dataSources.map(s => 
                  s.id === sourceId ? { ...s, importHistory: newHistory } : s
              )
          });
          
          showToast('تمت استعادة حالة الاستقرار بنجاح');
      } finally {
          setGlobalLoading(false);
      }
  };

  const syncDataSource = async (sourceId: string) => {
      const sourceConfig = config.dataSources.find(ds => ds.id === sourceId);
      if (!sourceConfig || sourceConfig.type !== 'api') return;
      
      setGlobalLoading(true, `جاري مزامنة ${sourceConfig.label}...`);
      try {
          const context = { config, masterData: allMasterData };
          const rawData = await apiAdapterRef.current!.getTransactions({ forceRefresh: true }, sourceConfig, context);
          
          const batchId = `SYNC-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12)}`;
          const incoming = rawData.map(tx => ({ ...tx, batchId }));

          const overwritten = await saveDataset(sourceId, incoming, sourceConfig.updateStrategy, sourceConfig.primaryKeyField);
          
          const newBatch: ImportBatch = {
              id: batchId,
              importedAt: new Date().toISOString(),
              fileName: `API Sync: ${sourceConfig.label}`,
              rowCount: incoming.length,
              strategy: sourceConfig.updateStrategy,
              overwrittenBackup: overwritten.length > 0 ? overwritten : undefined
          };

          let history = [newBatch, ...(sourceConfig.importHistory || [])];
          history = history.map((b, idx) => idx >= 5 ? { ...b, overwrittenBackup: undefined } : b).slice(0, 20);
          
          updateConfig({ 
            dataSources: config.dataSources.map(ds => 
                ds.id === sourceId ? { 
                    ...ds, 
                    lastSyncAt: new Date().toISOString(), 
                    syncStatus: 'success',
                    importHistory: history
                } : ds
            ) 
          });
          showToast(`تمت مزامنة ${incoming.length} سجل بنجاح`);
      } catch (e) {
          updateConfig({ dataSources: config.dataSources.map(ds => ds.id === sourceId ? { ...ds, syncStatus: 'error' } : ds) });
          throw e; 
      } finally {
          setGlobalLoading(false);
      }
  };

  const getFilterOptions = useCallback((dataSourceIds?: string[]) => {
      const optionsMap: Record<string, string[]> = {};
      const filterableDimensions = (config.dimensionsRegistry || []).filter(d => d.enabled && d.ui.filter);
      let combinedData: NormalizedTransaction[] = [];
      
      const idsToQuery = (dataSourceIds && dataSourceIds.length > 0) ? dataSourceIds : (config.defaultDataSourceId ? [config.defaultDataSourceId] : []);
      idsToQuery.forEach(id => { if (datasets[id]) combinedData = combinedData.concat(datasets[id]); });
      
      filterableDimensions.forEach(dim => {
          const set = new Set<string>();
          combinedData.forEach(t => {
              const val = SchemaService.getValue(t, dim.id, config);
              if (val !== undefined && val !== null && val !== '') set.add(String(val));
          });
          optionsMap[dim.id] = Array.from(set).sort();
      });
      return optionsMap;
  }, [config, datasets]);

  return (
    <DataContext.Provider value={{ 
        dataAdapter: { getTransactions: async (q) => {
            const sourceId = q.dataSourceId || config.defaultDataSourceId;
            if (!sourceId) return [];
            
            const sourceConfig = config.dataSources.find(ds => ds.id === sourceId);
            const context = { config, masterData: allMasterData, activeGroup }; 
            if (sourceConfig && sourceConfig.type === 'api') return apiAdapterRef.current!.getTransactions(q, sourceConfig, context); 
            return excelAdapterRef.current!.getTransactions(q, undefined, context);
        }}, 
        datasets, 
        saveDataset, 
        deleteDataset,
        deleteTransaction,
        deleteBatch,
        getFilterOptions, 
        syncDataSource,
        isLoadingData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
