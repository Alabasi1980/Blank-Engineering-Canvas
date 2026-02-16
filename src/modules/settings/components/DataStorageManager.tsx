
import React, { useState, useEffect } from 'react';
import { 
    HardDrive, Trash2, RefreshCw, FolderInput, Save, ShieldCheck,
    DownloadCloud
} from 'lucide-react';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';
import { SettingHelpBlock } from './system/SettingHelpBlock';
import { PersistenceService } from '../../../core/services/PersistenceService';
import { useUI } from '../../../context/UIContext';
import { useModal } from '../../../context/ModalContext';
import { useCompany } from '../../../context/CompanyContext';
import { SimpleDonutChart } from '../../../shared/components/SimpleCharts';
import { useData } from '../../../core/context/DataContext';
import { useFileSystem } from '../../../hooks/useFileSystem';
import { useMasterDataStore } from '../../../context/MasterDataStoreContext';
import { Button } from '../../../shared/components/Button';

export const DataStorageManager: React.FC = () => {
    const { config } = useCompany();
    const { datasets, deleteDataset } = useData();
    const { allMasterData } = useMasterDataStore();
    const { showToast } = useUI();
    const { confirm } = useModal();
    const { directoryHandle, linkDirectory, saveFile, permissionState, verifyPermission } = useFileSystem();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [datasetMeta, setDatasetMeta] = useState<any[]>([]);
    const [storageUsage, setStorageUsage] = useState({ datasets: 0, masterData: 0, configs: 0 });

    const loadMetadata = async () => {
        setIsLoading(true);
        try {
            const meta = await PersistenceService.getDatasetsMetadata();
            setDatasetMeta(meta);
            const usage = await PersistenceService.getStorageUsage();
            setStorageUsage(usage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadMetadata(); }, []);

    const handleSyncToDisk = async () => {
        if (!directoryHandle) { await linkDirectory(); return; }
        if (permissionState !== 'granted') { await verifyPermission(); }
        
        setIsSyncing(true);
        try {
            await saveFile('config.json', config);
            for (const id in datasets) await saveFile(`${id}.json`, datasets[id], 'transactions');
            for (const id in allMasterData) await saveFile(`${id}.json`, allMasterData[id], 'master_data');
            showToast('تمت مزامنة كافة البيانات مع المجلد المحلي بنجاح');
        } catch (e) {
            showToast('فشل في المزامنة مع القرص', 'error');
        } finally { setIsSyncing(false); }
    };

    const handleFullExport = () => {
        const fullProject = { config, datasets, allMasterData, exportedAt: new Date().toISOString(), version: "2.5" };
        const blob = new Blob([JSON.stringify(fullProject, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EIS_Project_Backup_${config.branding.companyName}.json`;
        a.click();
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const chartData = [
        { label: 'الحركات', value: storageUsage.datasets, color: '#3b82f6' },
        { label: 'القوائم', value: storageUsage.masterData, color: '#8b5cf6' },
        { label: 'الإعدادات', value: storageUsage.configs, color: '#f59e0b' }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10 flex flex-col h-full">
            <SettingsSectionHeader 
                title="المستودع وإدارة التخزين (Repository)"
                description="إدارة تخزين المتصفح، المزامنة مع المجلد المحلي، وتأمين النسخ الاحتياطية لكامل المنظومة."
                icon={HardDrive}
                bgClass="bg-slate-500/10"
                iconColorClass="text-slate-400"
                action={
                    <div className="flex gap-2">
                        <Button onClick={handleFullExport} variant="secondary" size="sm" icon={<DownloadCloud size={16}/>}>تصدير ملف كامل</Button>
                        <Button onClick={handleSyncToDisk} loading={isSyncing} size="sm" icon={directoryHandle ? <Save size={16}/> : <FolderInput size={16}/>}>
                            {directoryHandle ? 'تحديث المزامنة المحلية' : 'ربط مجلد الحفظ'}
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-3xl border border-border-subtle shadow-sm p-6 flex flex-col md:flex-row items-center gap-10 bg-surface-card">
                    <div className="relative shrink-0">
                        <SimpleDonutChart data={chartData} height={150} valueFormatter={formatBytes} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-txt-muted font-bold uppercase">المساحة</span>
                            <span className="text-lg font-black text-txt-main">{formatBytes(storageUsage.datasets + storageUsage.masterData + storageUsage.configs)}</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                        <h4 className="text-xs font-black text-txt-muted uppercase tracking-widest border-b border-border-subtle pb-2">تفاصيل الذاكرة النشطة</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {chartData.map(c => (
                                 <div key={c.label} className="flex flex-col gap-1 p-3 bg-surface-input rounded-xl border border-border-subtle">
                                     <span className="text-[10px] font-bold text-txt-secondary">{c.label}</span>
                                     <span className="text-sm font-black text-txt-main">{formatBytes(c.value)}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>

                <div className={`rounded-3xl p-6 border flex flex-col justify-center gap-4 relative overflow-hidden ${directoryHandle ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${directoryHandle ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                            {directoryHandle ? <ShieldCheck size={24}/> : <FolderInput size={24}/>}
                        </div>
                        <div>
                            <h4 className={`font-black ${directoryHandle ? 'text-emerald-400' : 'text-blue-400'}`}>
                                {directoryHandle ? 'المزامنة فعالة' : 'المزامنة معطلة'}
                            </h4>
                            <p className={`text-[10px] ${directoryHandle ? 'text-emerald-300' : 'text-blue-300'}`}>
                                {directoryHandle ? `/${directoryHandle.name}` : 'اربط مجلداً محلياً لتأمين البيانات.'}
                            </p>
                        </div>
                    </div>
                    {directoryHandle && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-300 mt-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             أنت الآن تحفظ نسخة تلقائية على القرص الصلب.
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card rounded-3xl border border-border-subtle shadow-xl overflow-hidden flex flex-col bg-surface-card">
                <div className="px-6 py-4 bg-surface-overlay border-b border-border-subtle flex justify-between items-center font-black text-[10px] text-txt-muted uppercase tracking-widest">
                    <span>حزم البيانات المخزنة (Datasets)</span>
                    <button onClick={loadMetadata} className="hover:text-blue-400 transition-colors"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-[10px] text-txt-muted border-b border-border-subtle">
                                <th className="px-6 py-4">المصدر</th>
                                <th className="px-6 py-4">السجلات</th>
                                <th className="px-6 py-4">المساحة</th>
                                <th className="px-6 py-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-xs font-bold text-txt-main">
                            {datasetMeta.length === 0 ? (
                                <tr><td colSpan={4} className="py-20 text-center text-txt-muted italic">لا توجد حركات مخزنة</td></tr>
                            ) : datasetMeta.map(ds => (
                                <tr key={ds.id} className="hover:bg-surface-overlay transition-colors">
                                    <td className="px-6 py-4">{ds.id}</td>
                                    <td className="px-6 py-4 text-txt-secondary tabular-nums">{ds.count.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-txt-secondary tabular-nums">{formatBytes(ds.size)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => deleteDataset(ds.id)} className="p-2 text-txt-muted hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SettingHelpBlock 
                title="لماذا نحتاج للمجلد المحلي؟"
                description="التطبيق يحفظ البيانات في ذاكرة المتصفح للسرعة، لكن المتصفح قد يمسح هذه الذاكرة فجأة. ربط مجلد محلي يضمن أنك تملك نسخة JSON حقيقية على جهازك، وهي المرجع النهائي عند حدوث أي خلل."
                onClick={() => {}}
                color="slate"
            />
        </div>
    );
};
