
import React from 'react';
import { Check } from 'lucide-react';
import { CARD_COLORS } from '../../constants';

interface ColorPickerProps {
  selectedColor?: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor = 'blue', 
  onChange,
  label = 'لون البطاقة'
}) => {
  return (
    <div>
      {label && <label className="block text-sm font-bold text-txt-secondary mb-3">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {CARD_COLORS.map((color) => {
          const isSelected = selectedColor === color.value;
          return (
            <button
              key={color.value}
              onClick={() => onChange(color.value)}
              className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 outline-none
                ${color.bg} 
                ${isSelected 
                    ? 'ring-4 ring-offset-2 ring-border-subtle scale-110 shadow-md' 
                    : 'opacity-80 hover:opacity-100 hover:scale-105 ring-1 ring-white/20 ring-offset-1 ring-offset-transparent'
                }
              `}
              type="button"
              title={color.label}
            >
              {isSelected && (
                <div className="bg-white/20 rounded-full p-1 animate-scale-in">
                    <Check size={20} className="text-white drop-shadow-sm" strokeWidth={3} />
                </div>
              )}
              
              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-surface-sidebar text-txt-main border border-border-subtle text-[10px] font-bold py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg -translate-y-2 group-hover:translate-y-0">
                  {color.label}
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-border-subtle"></span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
