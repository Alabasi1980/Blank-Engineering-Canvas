
import React from 'react';
import { Settings, FileText, Calendar, Hash } from 'lucide-react';
import { FileParseOptions } from '../../../../types';
import { Button } from '../../../../../shared/components/Button';

interface StepOptionsProps {
  fileName: string;
  options: FileParseOptions;
  onChange: (updates: Partial<FileParseOptions>) => void;
  onNext: () => void;
  onBack: () => void;
  isProcessing: boolean;
  errors: string[];
}

export const StepOptions: React.FC<StepOptionsProps> = ({ 
  fileName, 
  options, 
  onChange, 
  onNext, 
  onBack, 
  isProcessing, 
  errors 
}) => {
  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-border-subtle shadow-lg space-y-8 animate-fade-in bg-surface-card">
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Settings size={24} />
        </div>
        <div>
            <h3 className="text-xl font-black text-txt-main">إعدادات قراءة الملف</h3>
            <p className="text-xs text-txt-muted font-mono" dir="ltr">{fileName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CSV Specific Options */}
        {options.format === 'csv' && (
          <div className="space-y-4 bg-surface-input p-6 rounded-2xl border border-border-subtle">
            <h4 className="text-xs font-black text-txt-muted uppercase tracking-widest flex items-center gap-2">
                <FileText size={14}/> إعدادات النص (CSV)
            </h4>
            <div>
              <label className="block text-xs font-bold text-txt-secondary mb-2">الترميز (Encoding)</label>
              <select 
                value={options.encoding || 'UTF-8'}
                onChange={(e) => onChange({ encoding: e.target.value })}
                className="w-full p-3 border border-border-subtle rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-surface-card text-txt-main cursor-pointer"
              >
                <option value="UTF-8">UTF-8 (قياسي)</option>
                <option value="windows-1256">Arabic (Windows-1256)</option>
                <option value="ISO-8859-6">Arabic (ISO-8859-6)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-txt-secondary mb-2">الفاصل (Delimiter)</label>
              <select 
                value={options.delimiter || ''}
                onChange={(e) => onChange({ delimiter: e.target.value })}
                className="w-full p-3 border border-border-subtle rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-surface-card text-txt-main cursor-pointer"
              >
                <option value="">تلقائي (Auto Detect)</option>
                <option value=",">فاصلة (,)</option>
                <option value=";">فاصلة منقوطة (;)</option>
                <option value="\t">Tab</option>
              </select>
            </div>
          </div>
        )}

        {options.format === 'xlsx' && (
          <div className="col-span-1 md:col-span-2 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-3">
              <FileText size={20} className="text-emerald-400" />
              <p className="text-xs font-bold text-emerald-200">
                  ملفات Excel يتم قراءتها تلقائياً. تأكد أن الصف الأول يحتوي على العناوين.
              </p>
          </div>
        )}

        {/* Global Format Options */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-xs font-black text-txt-muted uppercase tracking-widest flex items-center gap-2">
              <Hash size={14}/> تنسيقات المحتوى
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-txt-secondary mb-2 flex items-center gap-1"><Calendar size={12}/> صيغة التاريخ في الملف</label>
              <select 
                value={options.dateFormat || 'auto'}
                onChange={(e) => onChange({ dateFormat: e.target.value as any })}
                className="w-full p-3 border border-border-subtle rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-surface-input text-txt-main cursor-pointer hover:bg-surface-overlay"
              >
                <option value="auto">تلقائي (Auto Detect)</option>
                <option value="YYYY-MM-DD">2024-03-15 (ISO)</option>
                <option value="DD/MM/YYYY">15/03/2024 (UK/Arab)</option>
                <option value="MM/DD/YYYY">03/15/2024 (US)</option>
              </select>
              <p className="text-[10px] text-txt-muted mt-1">اختر التنسيق المطابق لملفك لضمان قراءة التواريخ بشكل صحيح.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-txt-secondary mb-2 flex items-center gap-1"><Hash size={12}/> صيغة الأرقام</label>
              <select 
                value={options.numberFormat || 'auto'}
                onChange={(e) => onChange({ numberFormat: e.target.value as any })}
                className="w-full p-3 border border-border-subtle rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-surface-input text-txt-main cursor-pointer hover:bg-surface-overlay"
              >
                <option value="auto">تلقائي (1,234.56)</option>
                <option value="de-DE">أوروبي (1.234,56)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border-subtle">
        <Button variant="secondary" onClick={onBack}>رجوع</Button>
        <Button onClick={onNext} loading={isProcessing} className="shadow-lg shadow-blue-500/20">
          معاينة البيانات
        </Button>
      </div>
      
      {errors.length > 0 && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs font-bold border border-red-500/30">
          {errors[0]}
        </div>
      )}
    </div>
  );
};
