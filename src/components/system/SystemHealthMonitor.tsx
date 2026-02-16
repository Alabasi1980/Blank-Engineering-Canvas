
import React, { useState, useEffect } from 'react';
import { HardDrive, CheckCircle2, ShieldAlert, Key, FolderSync, RefreshCw } from 'lucide-react';
import { useFileSystem } from '../../hooks/useFileSystem';
import { PersistenceService } from '../../core/services/PersistenceService';

export const SystemHealthMonitor: React.FC = () => {
    const { directoryHandle, permissionState, verifyPermission } = useFileSystem();
    const [dbStatus, setDbStatus] = useState<'healthy' | 'warning'>('healthy');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const checkDB = async () => {
            try {
                await PersistenceService.getDatasetsMetadata();
                setDbStatus('healthy');
            } catch { setDbStatus('warning'); }
        };
        checkDB();
        const interval = setInterval(checkDB, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!directoryHandle) return null;

    const isDiskLocked = permissionState !== 'granted';

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-6 left-6 z-[100] animate-fade-in no-print"
        >
            <div className={`flex items-center gap-3 p-1.5 rounded-2xl backdrop-blur-md border transition-all duration-500 shadow-2xl bg-surface-sidebar ${
                isDiskLocked ? 'border-amber-500/50 text-amber-100' : 'border-border-subtle text-txt-main'
            } ${isHovered ? 'pr-6' : 'w-12'}`}>
                
                <div className="shrink-0">
                    {isDiskLocked ? (
                        <button 
                            onClick={() => verifyPermission()}
                            className="w-9 h-9 bg-surface-card text-amber-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse border border-amber-500/30"
                            title="اضغط لفتح قفل المجلد المحلي"
                        >
                            <Key size={18} strokeWidth={3} />
                        </button>
                    ) : (
                        <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-lg">
                            <HardDrive size={18} />
                        </div>
                    )}
                </div>

                {isHovered && (
                    <div className="flex items-center gap-6 whitespace-nowrap overflow-hidden animate-fade-in">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-txt-muted">مستودع البيانات</span>
                            <span className="text-[10px] font-bold text-txt-main" dir="ltr">/{directoryHandle.name}</span>
                        </div>
                        
                        <div className="h-6 w-px bg-border-subtle"></div>
                        
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-txt-muted">حالة القرص</span>
                            <div className="flex items-center gap-1.5">
                                {isDiskLocked ? <ShieldAlert size={12} className="text-amber-500"/> : <CheckCircle2 size={12} className="text-emerald-400"/>}
                                <span className={`text-[10px] font-bold ${isDiskLocked ? 'text-amber-500' : 'text-emerald-400'}`}>{isDiskLocked ? 'مغلق (Lock)' : 'نشط'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-txt-muted">IndexedDB</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'healthy' ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`}></div>
                                <span className="text-[10px] font-bold text-txt-main">{dbStatus === 'healthy' ? 'مستقر' : 'تنبيه'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
