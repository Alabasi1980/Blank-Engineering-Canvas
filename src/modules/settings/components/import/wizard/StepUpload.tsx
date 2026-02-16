
import React, { useRef } from 'react';
import { UploadCloud, ArrowRight } from 'lucide-react';

interface StepUploadProps {
  onFileSelect: (file: File) => void;
  onCancel: () => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({ onFileSelect, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div onClick={onCancel} className="flex items-center gap-2 text-txt-muted hover:text-txt-main cursor-pointer text-sm transition-colors w-fit">
        <ArrowRight size={16} /> العودة
      </div>
      <h3 className="text-xl font-bold text-txt-main">رفع ملف البيانات</h3>
      
      <div 
        className="border-2 border-dashed border-border-subtle rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-surface-card hover:bg-surface-overlay hover:border-primary-500/50 transition-all cursor-pointer relative group shadow-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv,.xlsx,.xls"
          className="hidden" 
          onChange={handleFileChange}
        />
        <div className="w-20 h-20 bg-surface-input text-primary-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-border-subtle">
          <UploadCloud size={40} />
        </div>
        <h4 className="font-bold text-lg text-txt-main group-hover:text-primary-400 transition-colors">اضغط لرفع ملف CSV أو Excel</h4>
        <p className="text-sm text-txt-muted mt-2">يدعم الملفات الكبيرة واللغة العربية</p>
      </div>
    </div>
  );
};
