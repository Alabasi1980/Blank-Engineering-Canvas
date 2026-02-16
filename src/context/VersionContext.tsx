import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { VersionStore, PublishedVersionInfo } from '../core/config/versionStore';
import { CompanyConfig, ValidationError } from '../types';
// Fix: Use ValidationService instead of deleted validateCompanyConfig
import { ValidationService } from '../core/services/ValidationService';
import { useCompany } from './CompanyContext';

interface VersionContextType {
  currentVersionId: string | null;
  currentPublishedAt: string | null;
  isDraftMode: boolean;
  publishNow: () => Promise<{ success: boolean; errors?: ValidationError[] }>;
  rollback: (versionId: string) => Promise<void>;
  discardDraft: () => Promise<void>;
  isIdenticalToPublished: boolean;
  // Track the currently serving version in history
  lastPublishedVersionId: string | null;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config, setCompanyConfig, companyConfig } = useCompany();
  
  const [publishedState, setPublishedState] = useState<{
      config: CompanyConfig | null;
      versionId: string | null;
      publishedAt: string | null;
  }>({ config: null, versionId: null, publishedAt: null });

  const [isLoading, setIsLoading] = useState(true);

  // تحميل الحالة المنشورة مرة واحدة فقط عند البداية
  const refreshPublishedState = async () => {
    try {
      const published = await VersionStore.loadPublished();
      if (published) {
          setPublishedState({
              config: published.config,
              versionId: published.versionId,
              publishedAt: published.publishedAt
          });
      } else {
          setPublishedState({ config: null, versionId: null, publishedAt: null });
      }
    } catch (e) {
      console.error("Failed to load published version", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPublishedState();
  }, []);

  // مقارنة ذكية: هل المسودة الحالية تطابق النسخة المنشورة؟
  const isIdenticalToPublished = useMemo(() => {
      if (!publishedState.config) return false;
      return JSON.stringify(companyConfig) === JSON.stringify(publishedState.config);
  }, [companyConfig, publishedState.config]);

  // تحديد وضع المسودة
  const isDraftMode = !isIdenticalToPublished;

  const publishNow = async () => {
    const draftToPublish = config; 
    const validation = ValidationService.validateConfig(draftToPublish);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const result = await VersionStore.publishDraft(draftToPublish);
    
    setPublishedState({
        config: draftToPublish,
        versionId: result.publishedVersionId,
        publishedAt: new Date().toISOString()
    });
    
    await VersionStore.saveDraft(draftToPublish);

    return { success: true };
  };

  const rollback = async (versionId: string) => {
    await VersionStore.rollbackTo(versionId);
    await refreshPublishedState();
  };

  const discardDraft = async () => {
      if (publishedState.config) {
          setCompanyConfig(publishedState.config);
          await VersionStore.saveDraft(publishedState.config);
      } else {
          window.location.reload(); 
      }
  };

  return (
    <VersionContext.Provider value={{
      currentVersionId: publishedState.versionId,
      currentPublishedAt: publishedState.publishedAt,
      isDraftMode,
      publishNow,
      rollback,
      discardDraft,
      isIdenticalToPublished,
      lastPublishedVersionId: publishedState.versionId
    }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (context === undefined) throw new Error('useVersion must be used within a VersionProvider');
  return context;
};