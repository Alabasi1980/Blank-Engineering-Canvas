
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { CompanyConfig, BrandingConfig } from '../types';
import { defaultCompanyConfig } from '../config/defaultCompanyConfig';
import { VersionStore } from '../core/config/versionStore';
import { LocalFileSystemService } from '../core/services/LocalFileSystemService';
import { migrateConfig } from '../core/utils/configMigrator';
import { ColorFactory } from '../core/theme/ColorFactory';

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

  // Global Theme Application Effect
  useEffect(() => {
    if (!isLoaded || !config.branding.theme) return;
    
    const theme = config.branding.theme;
    const palette = ColorFactory.generate(theme.primaryColor, theme.mode);
    const root = document.documentElement;

    // Direct Mapping to EIS Design System Variables
    root.style.setProperty('--surface-app', palette.bg.app);
    root.style.setProperty('--surface-card', palette.bg.panel);
    root.style.setProperty('--surface-input', `rgba(${theme.mode === 'dark' ? '0,0,0' : '255,255,255'}, 0.3)`);
    root.style.setProperty('--surface-sidebar', `rgba(${theme.mode === 'dark' ? '15, 23, 42' : '248, 250, 252'}, 0.9)`);
    root.style.setProperty('--surface-overlay', `rgba(${theme.mode === 'dark' ? '30, 41, 59' : '255, 255, 255'}, 0.8)`);
    
    root.style.setProperty('--color-primary', palette.primary.base);
    root.style.setProperty('--color-primary-hover', palette.primary.hover);
    root.style.setProperty('--color-primary-glass', palette.primary.glass);
    root.style.setProperty('--color-primary-glow', palette.primary.glow);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    
    root.style.setProperty('--app-font', theme.fontFamily);
    root.style.setProperty('--glass-blur', `${theme.blur || 16}px`);
    root.style.setProperty('--radius-button', theme.radius === 'full' ? '9999px' : theme.radius === 'lg' ? '12px' : theme.radius === 'md' ? '8px' : '0px');

    // Texture
    let textureUrl = 'none';
    let textureSize = 'auto';
    if (theme.texture === 'grid') {
        textureUrl = `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`;
        textureSize = '40px 40px';
    } else if (theme.texture === 'dots') {
        textureUrl = `radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`;
        textureSize = '20px 20px';
    } else if (theme.texture === 'noise') {
        textureUrl = `url("https://www.transparenttextures.com/patterns/stardust.png")`;
    }
    root.style.setProperty('--bg-texture-image', textureUrl);
    root.style.setProperty('--bg-texture-size', textureSize);

    // Atmosphere
    root.style.setProperty('--bg-atmosphere', `radial-gradient(circle at 50% -20%, ${palette.primary.glass} 0%, ${palette.bg.app} 70%)`);

  }, [config.branding.theme, isLoaded]);

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
