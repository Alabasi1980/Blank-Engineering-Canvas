
import React, { useState } from 'react';
import { Database, FileText, Star, Plus, Globe, RefreshCw, Eye, Download, History, ShieldCheck, Key, Lock, FileSpreadsheet, Trash2 } from 'lucide-react';
import { DataSourceConfigItem, UpdateStrategy } from '../../../../types';
import { Button } from '../../../../shared/components/Button';
import { useData } from '../../../../core/context/DataContext';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { ImportHistoryModal } from './ImportHistoryModal';
import { DataSourceViewerModal } from './DataSourceViewerModal';
import { useCompany } from '../../../../context/CompanyContext';
import * as XLSX from 'xlsx';

interface DataSourceListProps {
  dataSources: DataSourceConfigItem[];
  defaultDataSourceId: string;
  onAdd: () => void;
  onEdit: (source: DataSourceConfigItem) => void;
  onSetDefault: (id: string) => void;
}

export const DataSourceList: React.FC<DataSourceListProps> = ({
  dataSources,
  defaultDataSourceId,
  onAdd,
  onEdit,
  onSetDefault
}) => {
  const { syncDataSource } = useData();
  const { config } = useCompany();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [historyModalSource, setHistoryModalSource] = useState<DataSourceConfigItem | null>(null);
  const [viewingSource, setViewingSource] = useState<DataSourceConfigItem | null>(null);

  const handleSync = async (id: string) => {
      setSyncingId(id);
      try { await syncDataSource(id); } 
      finally { setSyncingId(null); }
  };

  const handleDownloadTemplate = (source: DataSourceConfigItem) => {
      const headers = ['date', 'amount', 'description', 'sourceRef'];
      const displayHeaders = ['التاريخ', 'المبلغ', 'البيان', 'المرجع'];
      
      if (source.mapping) {
          config.dimensionsRegistry?.forEach(dim => {
              if (dim.enabled && dim.ui.import && !headers.includes(dim.id)) {
                  headers.push(dim.id);
                  displayHeaders.push(dim.label);
              }
          });
      }

      const ws = XLSX.utils.aoa_to_sheet([displayHeaders]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, `Template_${source.label}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-txt-main">الحاويات النشطة ({dataSources.length})</h3>
        </div>
        <Button onClick={onAdd} icon={<Plus size={16} />} className="shadow-lg shadow-blue-500/20">إنشاء حاوية جديدة</Button>
      </div>

      {dataSources.length === 0 ? (
          <EmptyState 
              icon={Database}
              title="المستودع فارغ"
              description="لم تقم بإنشاء أي حاويات بيانات بعد. ابدأ بإنشاء حاوية لرفع ملفاتك."
              action={{ label: 'إنشاء حاوية جديدة', onClick: onAdd, icon: <Plus size={16} /> }}
              className="text-txt-muted"
          />
      ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {dataSources.map(source => {
                  const isDefault = defaultDataSourceId === source.id;
                  const pkDisplay = Array.isArray(source.primaryKeyField) 
                    ? source.primaryKeyField.join(' + ') 
                    : source.primaryKeyField;

                  return (
                      <div key={source.id} className={`glass-card rounded-[2rem] border transition-all hover:shadow-xl group flex flex-col overflow-hidden bg-surface-card ${isDefault ? 'border-primary-500/50 shadow-md ring-1 ring-primary-500/20' : 'border-border-subtle shadow-sm'}`}>
                          {/* Header */}
                          <div className="p-6 border-b border-border-subtle flex justify-between items-start bg-gradient-to-r from-surface-overlay to-transparent">
                              <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-2xl shadow-sm ${source.type === 'file' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                      {source.type === 'file' ? <FileText size={24}/> : <Globe size={24}/>}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <h4 className="font-black text-lg text-txt-main">{source.label}</h4>
                                          {isDefault && <Star size={14} className="text-amber-500 fill-amber-500" />}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] font-bold text-txt-muted bg-surface-input px-2 py-0.5 rounded uppercase tracking-wider">{source.type}</span>
                                          <span className="text-[10px] text-txt-muted font-mono">ID: {source.id.slice(0,8)}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-1">
                                  <button onClick={() => onEdit(source)} className="p-2 text-txt-muted hover:text-primary-400 hover:bg-surface-overlay rounded-xl transition-all" title="إعدادات الحاوية">
                                      <RefreshCw size={18} />
                                  </button>
                                  <button onClick={() => onSetDefault(source.id)} className={`p-2 rounded-xl transition-all ${isDefault ? 'text-amber-500 bg-amber-500/10' : 'text-txt-muted hover:text-amber-400 hover:bg-surface-overlay'}`} title="تعيين كافتراضي">
                                      <Star size={18} fill={isDefault ? "currentColor" : "none"} />
                                  </button>
                              </div>
                          </div>

                          {/* Stats & Info */}
                          <div className="p-6 grid grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                  <span className="text-txt-muted font-bold block">استراتيجية التحديث</span>
                                  <StrategyBadge strategy={source.updateStrategy} />
                              </div>
                              <div className="space-y-1">
                                  <span className="text-txt-muted font-bold block">آخر نشاط</span>
                                  <span className="font-mono font-bold text-txt-main">
                                      {source.type === 'file' && source.fileMeta?.importedAt ? new Date(source.fileMeta.importedAt).toLocaleDateString('ar-SA') : 
                                       source.type === 'api' && source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleDateString('ar-SA') : '---'}
                                  </span>
                              </div>
                              <div className="col-span-2 mt-2 pt-4 border-t border-border-subtle flex gap-2">
                                  {pkDisplay && (
                                      <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded font-bold border border-purple-500/20 truncate max-w-full" title={pkDisplay}>
                                          <Key size={10} /> PK: {pkDisplay}
                                      </span>
                                  )}
                                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded font-bold border ${source.mapping ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                                      {source.mapping ? <Lock size={10} /> : <ShieldCheck size={10} />}
                                      {source.mapping ? 'هيكلية ثابتة' : 'مرنة'}
                                  </span>
                              </div>
                          </div>

                          {/* Actions Footer */}
                          <div className="mt-auto bg-surface-overlay/50 p-4 flex gap-2 justify-between items-center border-t border-border-subtle">
                              <div className="flex gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => setViewingSource(source)} icon={<Eye size={14} />} className="text-xs">معاينة</Button>
                                  <Button size="sm" variant="secondary" onClick={() => handleDownloadTemplate(source)} icon={<FileSpreadsheet size={14} />} className="text-xs">القالب</Button>
                              </div>
                              <button onClick={() => setHistoryModalSource(source)} className="flex items-center gap-1 text-xs font-bold text-txt-muted hover:text-primary-400 px-3 py-2 rounded-lg hover:bg-surface-overlay transition-all">
                                  <History size={14} /> السجل
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      {historyModalSource && (
          <ImportHistoryModal 
            isOpen={!!historyModalSource} 
            onClose={() => setHistoryModalSource(null)} 
            source={historyModalSource} 
          />
      )}

      {viewingSource && (
          <DataSourceViewerModal
            isOpen={!!viewingSource}
            onClose={() => setViewingSource(null)}
            source={viewingSource}
          />
      )}
    </div>
  );
};

const StrategyBadge = ({ strategy }: { strategy: UpdateStrategy }) => {
    if (strategy === 'upsert') return <span className="text-purple-400 font-bold flex items-center gap-1"><RefreshCw size={12}/> دمج ذكي (Upsert)</span>;
    if (strategy === 'append') return <span className="text-amber-400 font-bold flex items-center gap-1"><Plus size={12}/> إلحاق (Append)</span>;
    return <span className="text-red-400 font-bold flex items-center gap-1"><Trash2 size={12}/> استبدال (Replace)</span>;
};
