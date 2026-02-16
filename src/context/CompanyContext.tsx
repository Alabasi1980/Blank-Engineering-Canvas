
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { CompanyConfig, BrandingConfig } from '../types';
import { defaultCompanyConfig } from '../config/defaultCompanyConfig';
import { VersionStore } from '../core/config/versionStore';
import { LocalFileSystemService } from '../core/services/LocalFileSystemService';
import { migrateConfig } from '../core/utils/configMigrator';

interface CompanyContextType {
  config: CompanyConfig;
  companyConfig: CompanyConfig;
  setCompanyConfig: (c: React.SetStateAction<CompanyConfig>) => void;
  hasUnsavedChanges: boolean;
  configVersion: number;
  updateConfig: (updates: Partial<CompanyConfig>) => void;
  updateBranding: (updates: Partial<BrandingConfig>) => void;
  saveDraftNow: () => Promise<void>;
  resetToDefault: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CompanyConfig>(defaultCompanyConfig);
  const [savedDraftConfig, setSavedDraftConfig] = useState<CompanyConfig>(defaultCompanyConfig);
  const [configVersion, setConfigVersion] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitialLoad = useRef(true);

  // --- THEME ENGINE REMOVED: Relying on static CSS in variables.css ---

  const hasUnsavedChanges = useMemo(() => {
      if (!isLoaded) return false;
      return JSON.stringify(config) !== JSON.stringify(savedDraftConfig);
  }, [config, savedDraftConfig, isLoaded]);

  useEffect(() => {
    const initConfig = async () => {
      try {
        const draft = await VersionStore.loadDraft();
        if (draft) { 
            const merged = migrateConfig(draft);
            setSavedDraftConfig(merged); 
            setConfig(merged);
            setConfigVersion(v => v + 1);
        } else {
            setConfig(defaultCompanyConfig);
            setSavedDraftConfig(defaultCompanyConfig);
        }
      } catch (e) { 
          console.error("Failed to initialize config store", e); 
      } finally {
          setIsLoaded(true);
          isInitialLoad.current = false;
      }
    };
    initConfig();
  }, []);

  // Periodic Auto-Save
  useEffect(() => {
      if (isInitialLoad.current || !isLoaded) return;
      const timer = setTimeout(() => {
          VersionStore.saveDraft(config);
      }, 1000);
      return () => clearTimeout(timer);
  }, [config, isLoaded]);

  const setCompanyConfig = (action: React.SetStateAction<CompanyConfig>) => {
      setConfig(prev => {
          const next = typeof action === 'function' ? (action as any)(prev) : action;
          return next;
      });
      setConfigVersion(v => v + 1);
  };

  const updateConfig = (updates: Partial<CompanyConfig>) => {
      setCompanyConfig(prev => ({ ...prev, ...updates }));
  };

  const updateBranding = (updates: Partial<BrandingConfig>) => {
      setCompanyConfig(prev => ({ ...prev, branding: { ...prev.branding, ...updates } }));
  };

  const saveDraftNow = async () => {
    await VersionStore.saveDraft(config);
    setSavedDraftConfig(config);
    await LocalFileSystemService.sync('config.json', config);
  };

  const resetToDefault = () => {
        setConfig(defaultCompanyConfig);
        setSavedDraftConfig(defaultCompanyConfig);
        setConfigVersion(v => v + 1);
        VersionStore.saveDraft(defaultCompanyConfig);
  };

  return (
    <CompanyContext.Provider value={{
      config, companyConfig: config, setCompanyConfig, updateConfig, updateBranding,
      hasUnsavedChanges, configVersion,
      saveDraftNow, resetToDefault
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) throw new Error('useCompany must be used within a CompanyProvider');
  return context;
};
