
import React from 'react';
import { MASTER_ICONS } from '../../constants';

interface IconPickerProps {
  selectedIcon?: string;
  onChange: (iconKey: string) => void;
  label?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ 
  selectedIcon = 'Box', 
  onChange,
  label = 'الأيقونة'
}) => {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-txt-secondary mb-2">{label}</label>}
      <div className="grid grid-cols-5 gap-2 bg-surface-input p-2 rounded-xl border border-border-subtle">
        {Object.keys(MASTER_ICONS).map((key) => {
          const IconComp = MASTER_ICONS[key];
          const isSelected = selectedIcon === key;
          
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 aspect-square ${
                isSelected 
                  ? 'bg-primary-600 text-white shadow-neon ring-2 ring-primary-500/30 scale-110' 
                  : 'bg-surface-card border border-border-subtle text-txt-muted hover:text-primary-400 hover:border-primary-500/50 hover:bg-surface-overlay'
              }`}
              title={key}
              type="button"
            >
              <IconComp size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
