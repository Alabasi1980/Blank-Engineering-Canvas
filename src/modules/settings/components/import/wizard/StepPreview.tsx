
import React from 'react';
import { Table, Loader2 } from 'lucide-react';
import { ImportResult, FileParseOptions } from '../../../../core/importers/fileImporter';
import { Button } from '../../../../../shared/components/Button';
import { ProgressBar } from '../../../../../shared/components/ProgressBar';

interface StepPreviewProps {
  importResult: ImportResult | null;
  parseOptions: FileParseOptions;
  onOptionChange: (updates: Partial<FileParseOptions>) => void;
  onNext: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export const StepPreview: React.FC<StepPreviewProps> = ({
  importResult,
  parseOptions,
  onOptionChange,
  onNext,
  onBack,
  isProcessing
}) => {
  return (
    <div className="glass-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col h-[600px] bg-surface-card">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="font-bold text-txt-main flex items-center gap-2">
          <Table size={20} className="text-blue-500" />
          معاينة البيانات
        </h3>
        
        {parseOptions.format === 'xlsx' && importResult?.sheets && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-txt-muted">ورقة العمل:</span>
            <select 
              value={parseOptions.sheetName || importResult.sheets[0]}
              onChange={(e) => onOptionChange({ sheetName: e.target.value })}
              className="p-2 border border-blue-500/30 bg-blue-500/10 rounded-lg text-sm font-bold text-blue-300 outline-none cursor-pointer hover:bg-blue-500/20"
            >
              {importResult.sheets.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto border border-border-subtle rounded-lg custom-scrollbar relative bg-surface-input">
        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-app/80 z-10 backdrop-blur-sm">
            <div className="w-64">
                <ProgressBar indeterminate label="جاري معالجة البيانات..." />
            </div>
            <p className="text-xs text-txt-muted mt-2">قد تستغرق العملية بضع ثوانٍ للملفات الكبيرة</p>
          </div>
        ) : (
          <table className="w-full text-right text-xs whitespace-nowrap">
            <thead className="bg-surface-overlay text-txt-secondary font-bold sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-3 border-b border-border-subtle bg-surface-overlay">#</th>
                {importResult?.columns.map(col => (
                  <th key={col} className="p-3 border-b border-l border-border-subtle bg-surface-overlay">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-txt-main">
              {importResult?.rawRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-2 border-b border-border-subtle bg-surface-overlay/50 font-mono text-txt-muted border-l">{idx + 1}</td>
                  {importResult.columns.map(col => (
                    <td key={col} className="p-2 border-b border-l border-border-subtle text-txt-secondary">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4 shrink-0">
        <div className="text-xs text-txt-muted">
          تم قراءة أول {importResult?.rawRows.length} صف من أصل {importResult?.allRowsCount === -1 ? 'غير معروف' : importResult?.allRowsCount}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack} disabled={isProcessing}>تعديل الخيارات</Button>
          <Button onClick={onNext} loading={isProcessing}>التالي: ربط الأعمدة</Button>
        </div>
      </div>
    </div>
  );
};
