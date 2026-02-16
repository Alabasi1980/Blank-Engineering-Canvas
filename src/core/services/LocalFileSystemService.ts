import { PersistenceService } from './PersistenceService';

export interface FileEntry {
    name: string;
    lastModified?: number;
}

export const LocalFileSystemService = {
    isSupported(): boolean {
        return 'showDirectoryPicker' in window;
    },

    async sync(filename: string, content: any, subDir?: string): Promise<boolean> {
        try {
            const handle = await PersistenceService.load('handles', 'default_repo');
            if (!handle || !handle.handle) return false;
            const rootHandle = handle.handle as FileSystemDirectoryHandle;
            
            // @ts-ignore
            const perm = await rootHandle.queryPermission({ mode: 'readwrite' });
            if (perm !== 'granted') return false;

            let dir = rootHandle;
            if (subDir) dir = await rootHandle.getDirectoryHandle(subDir, { create: true });
            
            if (content === null) { 
                await dir.removeEntry(filename); 
                return true; 
            }

            const fileHandle = await dir.getFileHandle(filename, { create: true });
            // @ts-ignore
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(content, null, 2));
            await writable.close();
            return true;
        } catch (e) { 
            console.error("FSA_SYNC_ERROR", e);
            return false; 
        }
    },

    async listFiles(subDir?: string): Promise<FileEntry[]> {
        const handle = await PersistenceService.load('handles', 'default_repo');
        if (!handle || !handle.handle) return [];
        const rootHandle = handle.handle as FileSystemDirectoryHandle;
        
        try {
            let dir = rootHandle;
            if (subDir) dir = await rootHandle.getDirectoryHandle(subDir);
            
            const files: FileEntry[] = [];
            // @ts-ignore
            for await (const entry of dir.values()) {
                // Fix: Cast entry to FileSystemFileHandle to access getFile method
                if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                    const fileHandle = entry as FileSystemFileHandle;
                    const file = await fileHandle.getFile();
                    files.push({ name: entry.name, lastModified: file.lastModified });
                }
            }
            return files.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
        } catch { return []; }
    },

    async readFile(filename: string, subDir?: string): Promise<any> {
        const handle = await PersistenceService.load('handles', 'default_repo');
        if (!handle || !handle.handle) return null;
        const rootHandle = handle.handle as FileSystemDirectoryHandle;

        try {
            let dir = rootHandle;
            if (subDir) dir = await rootHandle.getDirectoryHandle(subDir);
            const fileHandle = await dir.getFileHandle(filename);
            const file = await fileHandle.getFile();
            const content = await file.text();
            return JSON.parse(content);
        } catch { return null; }
    },

    async deleteFile(filename: string, subDir?: string): Promise<boolean> {
        return this.sync(filename, null, subDir);
    }
};