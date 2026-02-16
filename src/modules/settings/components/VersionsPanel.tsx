
import React, { useEffect, useState } from 'react';
import { 
    History, CheckCircle2, AlertTriangle, GitBranch,
    FolderInput, HardDrive, Trash2, Link as LinkIcon, Clock,
    UploadCloud, FileCode
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useCompany } from '../../../context/CompanyContext';
import { useVersion } from '../../../context/VersionContext';
import { VersionStore, PublishedVersionInfo } from '../../../core/config/versionStore';
import { ValidationError } from '../../../types';
import { useModal } from '../../../context/ModalContext';
import { useUI } from '../../../context/UIContext';
import { useFileSystem, FileEntry } from '../../../hooks/useFileSystem';
import { SimpleInputModal } from '../../../shared/components/SimpleInputModal';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';

export const VersionsPanel: React.FC = () => {
  const { saveDraftNow, config } = useCompany();
  const { 
      currentVersionId, 
      lastPublishedVersionId,
      publishNow, 
      rollback, 
      isDraftMode, 
      discardDraft,
      isIdenticalToPublished 
  } = useVersion();

  const { confirm } = useModal();
  const { showToast } = useUI();
  
  const { linkDirectory, directoryHandle, permissionState, verifyPermission, listFiles, autoSaveToDirectory, deleteFile } = useFileSystem();

  const [history, setHistory] = useState<PublishedVersionInfo[]>([]);
  const [localFiles, setLocalFiles] = useState<FileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishErrors, setPublishErrors] = useState<ValidationError[]>([]);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const list = await VersionStore.listPublishedVersions();
      setHistory(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocalFiles = async () => {
      if (directoryHandle && permissionState === 'granted') {
          try {
            const files = await listFiles();
            setLocalFiles(files);
          } catch (e) {
              console.warn("Failed to list files");
          }
      }
  };

  useEffect(() => {
    loadHistory();
  }, [currentVersionId, isIdenticalToPublished, lastPublishedVersionId]); 

  useEffect(() => {
      if (directoryHandle && permissionState === 'granted') {
          refreshLocalFiles();
      }
  }, [directoryHandle, permissionState]);

  const initiatePublish = async () => {
    setIsNoteModalOpen(true); 
  };

  const handlePublishWithNote = async (note: string) => {
    setIsNoteModalOpen(false);
    setIsPublishing(true);
    setPublishErrors([]);
    
    try {
      const result = await publishNow();
      if (result.success) {
        setPublishSuccess(true);
        loadHistory();
        
        if (directoryHandle) {
            try {
                if (permissionState !== 'granted') await verifyPermission();
                const dateStr = new Date().toISOString().split('T')[0];
                const versionNum = history.length + 1;
                const noteSuffix = note ? `_${note.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 20)}` : '';
                const filename = `v${versionNum}_${dateStr}${noteSuffix}.json`;
                
                await autoSaveToDirectory(filename, { ...config, meta: { version: versionNum, note, exportedAt: new Date().toISOString() } });
                refreshLocalFiles();
            } catch (err) {
                console.error(err);
            }
        }
        setTimeout(() => setPublishSuccess(false), 3000);
      } else {
          setPublishErrors(result.errors || []);
      }
    } catch (e) {
        setPublishErrors([{ field: 'system', message: 'حدث خطأ غير متوقع أثناء النشر.', severity: 'error' }]);
    } finally {
        setIsPublishing(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if(await confirm({ title: 'استعادة نسخة النظام', message: 'سيتم العودة للإعدادات الخاصة بهذه النسخة فوراً.', variant: 'warning' })) {
        await rollback(versionId);
        window.location.reload();
    }
  };

  const handleDeleteLocalFile = async (name: string) => {
    if (await confirm({ 
        title: 'حذف ملف أرشيف', 
        message: `هل أنت متأكد من حذف الملف "${name}" من القرص الصلب؟ لا يمكن التراجع عن هذه العملية.`, 
        variant: 'danger' 
    })) {
        const success = await deleteFile(name);
        if (success) {
            refreshLocalFiles();
            showToast('تم حذف الملف بنجاح');
        }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 flex flex-col h-full">
        <SettingsSectionHeader 
            title="إدارة الإصدارات والمستودع"
            description="مركز التحكم بدورة حياة النظام. هنا يمكنك نشر التغييرات، استعادة النسخ السابقة، وإدارة الأرشيف المحلي."
            icon={GitBranch}
            bgClass="bg-indigo-500/10"
            iconColorClass="text-indigo-400"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card rounded-3xl border border-border-subtle shadow-sm p-6 relative overflow-hidden bg-surface-card">
                <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 shadow-[0_0_20px_#4f46e5]"></div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-txt-main text-lg flex items-center gap-2">
                            {isDraftMode ? <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
                            {isDraftMode ? 'يوجد تعديلات معلقة (Draft Mode)' : 'النظام مستقر ومحدّث (Live)'}
                        </h3>
                        <p className="text-xs text-txt-secondary mt-1">
                            {isDraftMode 
                                ? 'لقد قمت بإجراء تغييرات في الإعدادات. يجب نشرها لتصبح فعالة في لوحة القيادة.' 
                                : 'كافة الإعدادات الحالية مطابقة لآخر نسخة منشورة.'}
                        </p>
                    </div>
                    {isDraftMode && (
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={discardDraft} className="text-xs !py-2" icon={<AlertTriangle size={14} />}>تجاهل التعديلات</Button>
                            <Button 
                                onClick={initiatePublish} 
                                loading={isPublishing} 
                                icon={<UploadCloud size={16} />}
                                className="text-xs !py-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                            >
                                نشر التعديلات الآن
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${!isDraftMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-surface-input border-border-subtle text-txt-muted opacity-50'}`}>
                        <CheckCircle2 size={20} className="mb-2" />
                        <span className="text-xs font-black">إصدار منشور فعال</span>
                    </div>
                    <div className={`p-4 rounded-2xl border ${directoryHandle ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-surface-input border-border-subtle text-txt-muted opacity-50'}`}>
                        <HardDrive size={20} className="mb-2" />
                        <span className="text-xs font-black">المستودع المحلي مرتبط</span>
                    </div>
                </div>

                {publishSuccess && (
                    <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in-down text-xs font-bold">
                        <CheckCircle2 size={16} /> تم نشر النسخة وحفظها بنجاح!
                    </div>
                )}
            </div>

            <div className="bg-surface-input rounded-3xl border border-border-subtle p-6 flex flex-col justify-center gap-4 text-center">
                <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">إحصائيات الأرشفة</span>
                <div className="text-4xl font-black text-txt-main tabular-nums">{history.length}</div>
                <span className="text-xs font-bold text-txt-secondary">نسخة في سجل المتصفح</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
            <div className="glass-card rounded-3xl border border-border-subtle shadow-sm flex flex-col overflow-hidden bg-surface-card">
                <div className="px-6 py-5 border-b border-border-subtle bg-surface-overlay flex justify-between items-center font-bold text-txt-main">
                    <div className="flex items-center gap-2"><History size={18} className="text-blue-400"/> سجل المتصفح</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {history.length === 0 ? <div className="p-10 text-center text-txt-muted text-xs italic">لا يوجد إصدارات سابقة</div> :
                     history.map((ver, idx) => (
                        <div key={ver.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${ver.id === lastPublishedVersionId ? 'bg-blue-500/10 border-blue-500/30' : 'bg-surface-input border-border-subtle hover:border-blue-500/20 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${ver.id === lastPublishedVersionId ? 'bg-blue-600 text-white' : 'bg-surface-card text-txt-muted'}`}>
                                    {history.length - idx}
                                </div>
                                <div>
                                    <div className="text-xs font-black text-txt-main">{ver.id === lastPublishedVersionId ? 'النسخة الحالية' : `نسخة #${history.length - idx}`}</div>
                                    <div className="text-[10px] text-txt-muted flex items-center gap-1 mt-0.5"><Clock size={10}/> {new Date(ver.publishedAt).toLocaleString('ar-SA')}</div>
                                </div>
                            </div>
                            <button onClick={() => handleRollback(ver.id)} className="opacity-0 group-hover:opacity-100 p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all text-[10px] font-black uppercase">استعادة</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card rounded-3xl border border-border-subtle shadow-sm flex flex-col overflow-hidden bg-surface-card">
                <div className="px-6 py-5 border-b border-border-subtle bg-surface-overlay flex justify-between items-center font-bold text-txt-main">
                    <div className="flex items-center gap-2"><HardDrive size={18} className="text-indigo-400"/> الأرشيف المحلي (Disk)</div>
                    {!directoryHandle && <button onClick={linkDirectory} className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-1"><LinkIcon size={12}/> ربط المجلد</button>}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {!directoryHandle ? <div className="p-20 text-center text-txt-muted text-xs">اربط مجلداً محلياً لتفعيل النسخ الاحتياطية التلقائي</div> :
                     localFiles.length === 0 ? <div className="p-20 text-center text-txt-muted text-xs">لا توجد ملفات JSON في المجلد المختار</div> :
                     localFiles.map(file => (
                        <div key={file.name} className="p-4 rounded-2xl border border-border-subtle bg-surface-input hover:border-indigo-500/30 hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-surface-card text-indigo-400 rounded-lg"><FileCode size={18}/></div>
                                <div>
                                    <div className="text-xs font-black text-txt-main truncate max-w-[200px]" dir="ltr">{file.name}</div>
                                    <div className="text-[9px] text-txt-muted mt-0.5">{file.lastModified ? new Date(file.lastModified).toLocaleString() : '---'}</div>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteLocalFile(file.name)} className="p-2 text-txt-muted hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <SimpleInputModal 
            isOpen={isNoteModalOpen} 
            onClose={() => setIsNoteModalOpen(false)} 
            onSave={handlePublishWithNote} 
            title="نشر التغييرات" 
            label="ملاحظة الإصدار (اختياري)" 
            placeholder="مثال: تحديث معادلة الضريبة، إضافة بُعد جديد..." 
            confirmText="تأكيد النشر الرسمي"
        />
    </div>
  );
};
