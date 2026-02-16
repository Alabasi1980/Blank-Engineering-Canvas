import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReportSnapshot } from '../types';
import { PersistenceService } from '../core/services/PersistenceService';
import { useUI } from './UIContext';

interface SnapshotContextType {
    snapshots: ReportSnapshot[];
    activeSnapshotId: string | null;
    isSnapshotMode: boolean;
    takeSnapshot: (snapshot: Omit<ReportSnapshot, 'id' | 'capturedAt'>) => Promise<void>;
    viewSnapshot: (id: string | null) => void;
    deleteSnapshot: (id: string) => Promise<void>;
    isLoading: boolean;
}

const SnapshotContext = createContext<SnapshotContextType | undefined>(undefined);

export const SnapshotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [snapshots, setSnapshots] = useState<ReportSnapshot[]>([]);
    const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast, setGlobalLoading } = useUI();

    const loadSnapshots = async () => {
        setIsLoading(true);
        try {
            const result = await PersistenceService.getConfig('system:snapshots');
            setSnapshots(result?.data || []);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadSnapshots(); }, []);

    const takeSnapshot = async (data: Omit<ReportSnapshot, 'id' | 'capturedAt'>) => {
        setGlobalLoading(true, 'جاري تجميد أرقام التقرير...');
        const newSnapshot: ReportSnapshot = {
            ...data,
            id: `snap_${Date.now()}`,
            capturedAt: new Date().toISOString()
        };

        const newList = [newSnapshot, ...snapshots];
        await PersistenceService.saveConfig('system:snapshots', newList);
        setSnapshots(newList);
        setGlobalLoading(false);
        showToast('تمت أرشفة اللقطة بنجاح');
    };

    const deleteSnapshot = async (id: string) => {
        const newList = snapshots.filter(s => s.id !== id);
        await PersistenceService.saveConfig('system:snapshots', newList);
        setSnapshots(newList);
        if (activeSnapshotId === id) setActiveSnapshotId(null);
        showToast('تم حذف اللقطة التاريخية');
    };

    return (
        <SnapshotContext.Provider value={{
            snapshots,
            activeSnapshotId,
            isSnapshotMode: !!activeSnapshotId,
            takeSnapshot,
            viewSnapshot: setActiveSnapshotId,
            deleteSnapshot,
            isLoading
        }}>
            {children}
        </SnapshotContext.Provider>
    );
};

export const useSnapshots = () => {
    const context = useContext(SnapshotContext);
    if (!context) throw new Error('useSnapshots must be used within SnapshotProvider');
    return context;
};