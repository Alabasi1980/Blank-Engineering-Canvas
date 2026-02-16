import { CompanyConfig, Transaction } from '../../types';

const DB_NAME = 'ExecutiveIntelligenceDB';
const DB_VERSION = 6;
const STORES = { DATASETS: 'datasets', CONFIGS: 'configs', MASTER: 'master_data', HANDLES: 'handles' };

const openDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach(s => { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: s === STORES.MASTER ? 'type' : 'id' }); });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

export const PersistenceService = {
    // --- LocalStorage (Transient States) ---
    get(key: string, defaultValue: any) { 
        try { 
            const value = localStorage.getItem(key); 
            return value ? JSON.parse(value) : defaultValue; 
        } catch { return defaultValue; } 
    },
    set(key: string, value: any) { 
        localStorage.setItem(key, JSON.stringify(value)); 
    },

    // --- IndexedDB Core (Heavy Payload Storage) ---
    async save(store: string, item: any) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).put({ ...item, updatedAt: new Date().toISOString() });
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    },

    async load(store: string, id: string): Promise<any> {
        const db = await openDB();
        return new Promise((resolve) => {
            const req = db.transaction(store, 'readonly').objectStore(store).get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    },

    async loadAll(store: string): Promise<any[]> {
        const db = await openDB();
        return new Promise((resolve) => {
            const req = db.transaction(store, 'readonly').objectStore(store).getAll();
            req.onsuccess = () => resolve(req.result);
        });
    },

    async delete(store: string, id: string) {
        const db = await openDB();
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(id);
    },

    // --- High-Level Accessors ---
    
    // Fix: Add missing saveConfig method
    async saveConfig(id: string, data: any, metadata?: any) {
        return this.save(STORES.CONFIGS, { id, data, metadata });
    },

    // Fix: Add missing getConfig method
    async getConfig(id: string) {
        return this.load(STORES.CONFIGS, id);
    },

    async saveDataset(id: string, data: Transaction[]) {
        return this.save(STORES.DATASETS, { id, data });
    },

    // Fix: Add missing deleteDataset method
    async deleteDataset(id: string) {
        return this.delete(STORES.DATASETS, id);
    },

    async getDataset(id: string): Promise<Transaction[]> {
        const res = await this.load(STORES.DATASETS, id);
        return res ? res.data : [];
    },

    // Fix: Add missing saveMasterData method
    async saveMasterData(type: string, data: any) {
        return this.save(STORES.MASTER, { type, ...data });
    },

    // Fix: Add missing getMasterData method
    async getMasterData(type: string) {
        return this.load(STORES.MASTER, type);
    },

    async getAllDatasets(): Promise<Record<string, Transaction[]>> {
        const all = await this.loadAll(STORES.DATASETS);
        const map: Record<string, Transaction[]> = {};
        all.forEach(item => map[item.id] = item.data);
        return map;
    },

    async getDatasetsMetadata() {
        const all = await this.loadAll(STORES.DATASETS);
        return all.map(item => ({
            id: item.id,
            count: item.data.length,
            size: JSON.stringify(item.data).length,
            updatedAt: item.updatedAt
        }));
    },

    async getStorageUsage() {
        const datasets = await this.loadAll(STORES.DATASETS);
        const master = await this.loadAll(STORES.MASTER);
        const configs = await this.loadAll(STORES.CONFIGS);
        const calcSize = (arr: any[]) => JSON.stringify(arr).length;
        return {
            datasets: calcSize(datasets),
            masterData: calcSize(master),
            configs: calcSize(configs)
        };
    }
};