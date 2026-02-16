import { Transaction, ImportMapping, UpdateStrategy, AnalysisStats } from '../../types';
import { ValidationService } from './ValidationService';

export const ImportService = {
    /**
     * Generates a deterministic composite key for row-level integrity.
     */
    generateRowKey(tx: Transaction, keys: string[]): string {
        if (!keys || keys.length === 0) return tx.id;
        return keys.map(k => {
            if (['id', 'date', 'sourceRef', 'description', 'amount'].includes(k)) return String((tx as any)[k] || '');
            return String(tx.attributes?.[k] || '');
        }).join('_|_');
    },

    /**
     * Converts arbitrary raw row objects into normalized system Transactions.
     */
    normalize(rawData: any[], mapping: Partial<ImportMapping>): Transaction[] {
        return rawData.map(row => ({
            id: crypto.randomUUID(),
            date: String(row[mapping.date || ''] || ''),
            amount: parseFloat(String(row[mapping.amount || ''] || '0').replace(/[^0-9.-]/g, '')) || 0,
            description: String(row[mapping.description || ''] || ''),
            sourceRef: String(row[mapping.sourceRef || ''] || ''),
            attributes: Object.entries(mapping.customAttributes || {}).reduce((acc, [dimId, col]) => {
                acc[dimId] = row[col];
                return acc;
            }, {} as Record<string, any>)
        })).filter(tx => ValidationService.validateTransaction(tx).valid);
    },

    /**
     * Merges incoming data with existing storage based on configured strategy.
     */
    merge(existing: Transaction[], incoming: Transaction[], strategy: UpdateStrategy, keys: string[] | string | undefined): { finalData: Transaction[], overwrittenRecords: Transaction[] } {
        const pkFields = Array.isArray(keys) ? keys : (typeof keys === 'string' ? [keys] : []);
        
        if (strategy === 'replace_all') return { finalData: incoming, overwrittenRecords: [] };
        if (strategy === 'append') return { finalData: [...existing, ...incoming], overwrittenRecords: [] };

        const map = new Map<string, Transaction>();
        const overwritten: Transaction[] = [];
        existing.forEach(tx => map.set(this.generateRowKey(tx, pkFields), tx));

        incoming.forEach(tx => {
            const k = this.generateRowKey(tx, pkFields);
            if (map.has(k)) { 
                overwritten.push(map.get(k)!); 
                map.set(k, { ...tx, id: map.get(k)!.id }); 
            }
            else map.set(k, tx);
        });

        return { finalData: Array.from(map.values()), overwrittenRecords: overwritten };
    },

    /**
     * Provides a statistical report of an import batch before persistence.
     */
    analyze(incoming: Transaction[], existing: Transaction[], strategy: UpdateStrategy, keys: string[]): AnalysisStats {
        const stats: AnalysisStats = { totalFileRows: incoming.length, newRecords: 0, updatedRecords: 0, identicalRecords: 0, rejectedDuplicates: 0, invalidRows: 0, actions: { toInsert: [], toUpdate: [], toSkip: [] }, rejectedData: [] };
        const existingMap = new Map<string, Transaction>();
        if (strategy !== 'replace_all') existing.forEach(tx => existingMap.set(this.generateRowKey(tx, keys), tx));

        const seen = new Set<string>();
        incoming.forEach(tx => {
            const k = this.generateRowKey(tx, keys);
            if (seen.has(k)) { stats.rejectedDuplicates++; return; }
            seen.add(k);
            const match = existingMap.get(k);
            if (match) {
                if (JSON.stringify({...tx, id:''}) === JSON.stringify({...match, id:''})) { 
                    stats.identicalRecords++; stats.actions.toSkip.push(match); 
                } else { 
                    stats.updatedRecords++; stats.actions.toUpdate.push({...tx, id: match.id}); 
                }
            } else { 
                stats.newRecords++; stats.actions.toInsert.push(tx); 
            }
        });
        return stats;
    },

    smartMergeData<T extends { id: string }>(current: T[], incoming: T[]): { merged: T[], added: number, updated: number } {
        const map = new Map<string, T>();
        current.forEach(item => map.set(item.id, item));
        let added = 0; let updated = 0;
        incoming.forEach(item => {
            if (map.has(item.id)) {
                const existing = map.get(item.id)!;
                if (JSON.stringify(existing) !== JSON.stringify(item)) updated++;
                map.set(item.id, item);
            } else { 
                map.set(item.id, item); 
                added++; 
            }
        });
        return { merged: Array.from(map.values()), added, updated };
    }
};