import { CompanyConfig } from '../../types';
import { PersistenceService } from '../services/PersistenceService';

const KEY_DRAFT = 'companyConfig:draft';
const KEY_PUBLISHED_ACTIVE = 'companyConfig:published:active';
const KEY_PUBLISHED_INDEX = 'companyConfig:published:index';
const PREFIX_PUBLISHED_VERSION = 'companyConfig:published:';

export interface PublishedVersionInfo {
  id: string; // Changed from versionId to id to match UI usage
  config?: CompanyConfig; // Optional in list
  publishedAt: string;
  publishedBy?: string;
}

export const VersionStore = {
  // --- DRAFT ---
  saveDraft: async (config: CompanyConfig): Promise<void> => {
    await PersistenceService.saveConfig(KEY_DRAFT, config);
  },

  loadDraft: async (): Promise<CompanyConfig | null> => {
    const result = await PersistenceService.getConfig(KEY_DRAFT);
    return result ? result.data : null;
  },

  // --- PUBLISH ---
  publishDraft: async (configToPublish: CompanyConfig): Promise<{ publishedVersionId: string }> => {
    const versionId = crypto.randomUUID();
    const publishedAt = new Date().toISOString();
    const storageKey = `${PREFIX_PUBLISHED_VERSION}${versionId}`;

    // 1. Save the snapshot
    await PersistenceService.saveConfig(storageKey, configToPublish, { publishedAt, versionId });

    // 2. Update the Active Pointer
    await PersistenceService.saveConfig(KEY_PUBLISHED_ACTIVE, { versionId });

    // 3. Update the Index (List of versions)
    const indexResult = await PersistenceService.getConfig(KEY_PUBLISHED_INDEX);
    const history: PublishedVersionInfo[] = indexResult ? indexResult.data : [];
    
    // Prepend new version
    const newHistory = [{ id: versionId, publishedAt }, ...history];
    // Limit history to last 20 versions to save space (optional)
    if (newHistory.length > 20) newHistory.pop(); 

    await PersistenceService.saveConfig(KEY_PUBLISHED_INDEX, newHistory);

    return { publishedVersionId: versionId };
  },

  // --- LOAD LIVE ---
  loadPublished: async (): Promise<{ config: CompanyConfig, versionId: string, publishedAt: string } | null> => {
    // 1. Get Active Pointer
    const ptrResult = await PersistenceService.getConfig(KEY_PUBLISHED_ACTIVE);
    if (!ptrResult || !ptrResult.data?.versionId) return null;

    const versionId = ptrResult.data.versionId;
    
    // 2. Get Config Payload
    const configResult = await PersistenceService.getConfig(`${PREFIX_PUBLISHED_VERSION}${versionId}`);
    if (!configResult) return null;

    return {
        config: configResult.data,
        versionId: versionId,
        publishedAt: configResult.metadata?.publishedAt || configResult.updatedAt
    };
  },

  // --- LIST & ROLLBACK ---
  listPublishedVersions: async (): Promise<PublishedVersionInfo[]> => {
    const result = await PersistenceService.getConfig(KEY_PUBLISHED_INDEX);
    return result ? result.data : [];
  },

  getVersions: async (): Promise<PublishedVersionInfo[]> => {
    return VersionStore.listPublishedVersions();
  },

  rollbackTo: async (versionId: string): Promise<void> => {
    // Verify existence
    const target = await PersistenceService.getConfig(`${PREFIX_PUBLISHED_VERSION}${versionId}`);
    if (!target) throw new Error("Version not found");

    // Update pointer
    await PersistenceService.saveConfig(KEY_PUBLISHED_ACTIVE, { versionId });
    
    // Overwrite draft so edit starts from rolled-back version
    await PersistenceService.saveConfig(KEY_DRAFT, target.data);
  },

  savePublished: async (config: CompanyConfig): Promise<string> => {
      const result = await VersionStore.publishDraft(config);
      return result.publishedVersionId;
  }
};