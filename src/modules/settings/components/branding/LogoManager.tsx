
import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';

interface LogoManagerProps {
  logo?: string;
  onUpdate: (logo?: string) => void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({ logo, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 1 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onUpdate(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-txt-main border-b border-border-subtle pb-2 flex items-center gap-2">
        <ImageIcon size={16} className="text-txt-muted" />
        شعار الشركة (Logo)
      </h4>
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border-subtle flex items-center justify-center bg-surface-input overflow-hidden relative group hover:border-primary-500/50 transition-colors">
          {logo ? (
            <>
              <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => onUpdate(undefined)} className="text-white bg-red-500 p-1.5 rounded-full hover:bg-red-600" title="حذف الشعار">
                  <X size={14} />
                </button>
              </div>
            </>
          ) : <ImageIcon size={32} className="text-txt-muted opacity-50" />}
        </div>
        <div className="flex-1">
          <p className="text-xs text-txt-secondary mb-3 leading-relaxed">يفضل استخدام صورة مربعة أو شفافة (PNG). الحجم الأقصى 1 ميجابايت.</p>
          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg, image/svg+xml" className="hidden" />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} icon={<Upload size={14} />}>رفع شعار جديد</Button>
        </div>
      </div>
    </div>
  );
};
