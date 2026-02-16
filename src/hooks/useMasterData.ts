import { useCompany } from '../context/CompanyContext';
import { useMasterDataStore } from '../context/MasterDataStoreContext';
import { GenericTreeNode } from '../types';
import { useModal } from '../context/ModalContext';
import { IntegrationExecutor } from '../core/integrations/IntegrationExecutor';
import { ImportService } from '../core/services/ImportService';
import { useUI } from '../context/UIContext';
import { IntegrityService } from '../core/logic/IntegrityService';

/**
 * useMasterData
 * Simplified Hook focused on data orchestration, delegating logic to services.
 */
export const useMasterData = () => {
  const { config, updateConfig } = useCompany(); 
  const { saveEntityData, getEntityData } = useMasterDataStore();
  const { alert, confirm } = useModal();
  const { showToast } = useUI();

  /**
   * Unified protected delete method for ANY registry item.
   */
  const deleteRegistryItem = async (entityId: string, itemId: string, itemName?: string) => {
      // 1. Generic Tree Integrity Check
      const allItems = getEntityData(entityId);
      const hasChildren = allItems.some(i => i.parentId === itemId);
      
      if (hasChildren) {
          await alert(`لا يمكن حذف العنصر "${itemName || itemId}" لأنه يحتوي على عناصر فرعية تابعة له.`);
          return false;
      }

      // 2. Cross-system Dependency Check via IntegrityService
      const usages = IntegrityService.checkMasterDataItemUsage(config, entityId, itemId);
      if (usages.length > 0) {
          const usageList = usages.slice(0, 3).map(u => `• ${u}`).join('\n');
          const more = usages.length > 3 ? `\n...و ${usages.length - 3} أماكن أخرى.` : '';
          await alert(`لا يمكن حذف "${itemName || itemId}" لأنه مستخدم في المواقع التالية:\n\n${usageList}${more}`, 'عنصر قيد الاستخدام');
          return false;
      }

      // 3. User Confirmation
      if (!(await confirm({ 
          title: 'تأكيد الحذف النهائي', 
          message: `هل أنت متأكد من حذف "${itemName || itemId}" من السجل؟`, 
          variant: 'danger' 
      }))) return false;

      // 4. Execution
      const newItems = allItems.filter(i => i.id !== itemId);
      await saveEntityData(entityId, newItems);
      showToast('تم الحذف بنجاح');
      return true;
  };

  const handleUpdateTermLabel = (termKey: string, itemKey: string, value: string) => {
      updateConfig({ 
          terminology: { 
              ...config.terminology, 
              [termKey]: { 
                  ...(config.terminology[termKey] || {}), 
                  [itemKey]: value 
              } 
          } 
      });
  };

  const executeSyncProfile = async (profileId: string) => {
      const profile = config.integrationProfiles.find(p => p.id === profileId);
      if (!profile) throw new Error("Profile not found");

      const incomingData = await IntegrationExecutor.execute(profile);
      const entity = profile.targetEntity;

      const current = getEntityData(entity);
      const { merged, added, updated } = ImportService.smartMergeData<GenericTreeNode>(current, incomingData);
      
      await saveEntityData(entity, merged);
      
      const updatedProfile = { ...profile, lastSyncAt: new Date().toISOString(), lastSyncCount: incomingData.length };
      updateConfig({ integrationProfiles: config.integrationProfiles.map(p => p.id === profileId ? updatedProfile : p) });

      return { added, updated };
  };

  return {
      deleteRegistryItem,
      handleUpdateTermLabel,
      executeSyncProfile
  };
};