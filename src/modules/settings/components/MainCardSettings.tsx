
import React from 'react';
import { Trash2, Layout } from 'lucide-react';
import { MainCard } from '../../../types';
import { ColorPicker } from '../../../shared/components/ColorPicker';
import { CARD_COLORS } from '../../../constants';

interface MainCardSettingsProps {
  card: MainCard;
  onUpdate: (updates: Partial<MainCard>) => void;
  onDelete: () => void;
}

export const MainCardSettings: React.FC<MainCardSettingsProps> = ({ 
  card, 
  onUpdate, 
  onDelete 
}) => {
  const theme = CARD_COLORS.find(c => c.value === card.color) || CARD_COLORS[0];
  
  // Use the defined border class from the theme or fallback
  const activeBorder = theme.ring.replace('ring-', 'border-').replace('500', '500/50');

  return (
    <div className={`glass-card mb-8 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] border-t-[4px] ${activeBorder}`}>
      {/* Dynamic Header */}
      <div className={`px-6 py-5 flex justify-between items-start border-b border-border-subtle bg-gradient-to-r from-surface-overlay to-transparent`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} text-white shadow-lg shadow-${theme.value}-500/20`}>
             <Layout size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-txt-main">إعدادات المجموعة</h3>
            <p className="text-xs text-txt-secondary font-normal mt-1 opacity-80">تخصيص الهوية البصرية والقواعد لهذه المجموعة</p>
          </div>
        </div>
        <button 
          onClick={onDelete}
          type="button"
          className="text-txt-secondary hover:text-red-400 bg-surface-input hover:bg-surface-overlay px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-transparent hover:border-red-500/30"
          title="حذف هذه المجموعة بالكامل"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">حذف المجموعة</span>
        </button>
      </div>
      
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-bold text-txt-secondary mb-2">عنوان المجموعة الرئيسية</label>
            <div className="relative group">
                <input 
                    type="text" 
                    value={card.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="input-fantasy w-full px-4 py-3 rounded-lg text-txt-main font-bold focus:border-primary-500 transition-all placeholder-txt-muted text-base"
                    placeholder="مثال: مجموعة المؤشرات التشغيلية"
                />
            </div>
            <p className="text-xs text-txt-muted mt-2 leading-relaxed">
                هذا العنوان سيظهر كفاصل رئيسي في لوحة القيادة ويجمع تحته البطاقات الفرعية.
            </p>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle flex flex-col justify-center items-center text-center">
          <ColorPicker 
            selectedColor={card.color} 
            onChange={(c) => onUpdate({ color: c })}
            label="لون تمييز المجموعة (Theme)" 
          />
          <p className="text-[10px] text-txt-muted mt-4 max-w-[200px]">
            سيتم تطبيق هذا اللون على رأس المجموعة وكافة البطاقات الفرعية بداخلها تلقائياً.
          </p>
        </div>
      </div>
    </div>
  );
};
