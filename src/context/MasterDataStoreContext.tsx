import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiConfig, MasterDataType, GenericTreeNode, SystemUser, UserGroup } from '../types';
import { PersistenceService } from '../core/services/PersistenceService';
import { useCompany } from './CompanyContext';
import { LocalFileSystemService } from '../core/services/LocalFileSystemService';

interface MasterDataStoreContextType {
  allMasterData: Record<string, any[]>;
  isLoading: boolean;
  isSyncing: boolean;
  dataVersion: number;
  saveEntityData: (entityId: string, data: any[]) => Promise<void>;
  getEntityData: (entityId: string) => any[];
  restoreFromDiskData: (entityId: string, data: any[]) => Promise<void>;
  clearMasterData: (entityId: string) => Promise<void>;
  saveUsersAndGroups: (users: SystemUser[], groups: UserGroup[]) => Promise<void>;
  syncMasterData: (type: MasterDataType, apiConfig: ApiConfig, mapping: any) => Promise<void>;
}

const MasterDataStoreContext = createContext<MasterDataStoreContextType | undefined>(undefined);

export const MasterDataStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config } = useCompany();
  const [masterData, setMasterData] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataVersion, setDataVersion] = useState(1);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const entityIds = (config.masterEntities?.map(e => e.id) || []);
        const systemEntities = ['users', 'user_groups', 'system:snapshots'];
        const allTargetIds = Array.from(new Set([...entityIds, ...systemEntities]));

        const promises = allTargetIds.map(async (id) => {
            const result = await PersistenceService.getMasterData(id);
            return { id, data: result && result.data ? result.data : [] };
        });
        
        const results = await Promise.all(promises);
        const dataMap: Record<string, any[]> = {};
        results.forEach(res => { dataMap[res.id] = res.data; });
        
        setMasterData(dataMap);
        setDataVersion(v => v + 1);
      } catch (e) {
        console.error("Failed to load master data system", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, [config.masterEntities]);

  const saveEntityData = async (entityId: string, data: any[]) => {
    setMasterData(prev => ({ ...prev, [entityId]: data }));
    setDataVersion(v => v + 1);
    await PersistenceService.saveMasterData(entityId, { data });
    await LocalFileSystemService.sync(`${entityId}.json`, data, 'master_data');
  };

  const restoreFromDiskData = async (entityId: string, data: any[]) => {
      await saveEntityData(entityId, data);
  };

  const getEntityData = (entityId: string) => masterData[entityId] || [];

  const clearMasterData = async (entityId: string) => {
    await saveEntityData(entityId, []);
  };

  const saveUsersAndGroups = async (users: SystemUser[], groups: UserGroup[]) => {
      await saveEntityData('user_groups', groups);
      await saveEntityData('users', users);
  };

  const syncMasterData = async (type: MasterDataType, apiConfig: ApiConfig, mapping: any) => {
    setIsSyncing(true);
    try {
      const response = await fetch(apiConfig.endpointUrl);
      if (!response.ok) throw new Error("API Fetch Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <MasterDataStoreContext.Provider value={{
      allMasterData: masterData, 
      isLoading, 
      isSyncing, 
      dataVersion,
      saveEntityData, 
      getEntityData, 
      restoreFromDiskData,
      clearMasterData,
      saveUsersAndGroups, 
      syncMasterData
    }}>
      {children}
    </MasterDataStoreContext.Provider>
  );
};

export const useMasterDataStore = () => {
  const context = useContext(MasterDataStoreContext);
  if (context === undefined) throw new Error('useMasterDataStore must be used within a MasterDataStoreProvider');
  return context;
};