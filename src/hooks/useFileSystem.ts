import { useState, useCallback, useEffect } from 'react';
import { PersistenceService } from '../core/services/PersistenceService';
import { LocalFileSystemService, FileEntry } from '../core/services/LocalFileSystemService';

export type { FileEntry };

export const useFileSystem = () => {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied'>('prompt');

  useEffect(() => {
      const init = async () => {
          const handle = await PersistenceService.load('handles', 'default_repo');
          if (handle && handle.handle) {
              setDirectoryHandle(handle.handle);
              // @ts-ignore
              setPermissionState(await handle.handle.queryPermission({ mode: 'readwrite' }));
          }
      };
      init();
  }, []);

  const linkDirectory = useCallback(async () => {
      // @ts-ignore
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirectoryHandle(handle);
      setPermissionState('granted');
      await PersistenceService.save('handles', { id: 'default_repo', handle });
  }, []);

  const verifyPermission = useCallback(async () => {
      if (!directoryHandle) return false;
      // @ts-ignore
      const perm = await directoryHandle.requestPermission({ mode: 'readwrite' });
      setPermissionState(perm);
      return perm === 'granted';
  }, [directoryHandle]);

  return { 
      directoryHandle, 
      permissionState, 
      linkDirectory, 
      verifyPermission,
      isSupported: LocalFileSystemService.isSupported(),
      saveFile: LocalFileSystemService.sync,
      saveMasterDataFile: (id: string, data: any[]) => LocalFileSystemService.sync(`${id}.json`, data, 'master_data'),
      loadMasterDataFile: (id: string) => LocalFileSystemService.readFile(`${id}.json`, 'master_data'),
      listFiles: (subDir?: string) => LocalFileSystemService.listFiles(subDir),
      readFromFile: (filename: string, subDir?: string) => LocalFileSystemService.readFile(filename, subDir),
      deleteFile: (filename: string, subDir?: string) => LocalFileSystemService.deleteFile(filename, subDir),
      autoSaveToDirectory: (filename: string, content: any, subDir?: string) => LocalFileSystemService.sync(filename, content, subDir),
      checkMasterDataExists: async (id: string) => {
          if (!directoryHandle) return false;
          try {
              const dir = await directoryHandle.getDirectoryHandle('master_data');
              await dir.getFileHandle(`${id}.json`);
              return true;
          } catch { return false; }
      }
  };
};