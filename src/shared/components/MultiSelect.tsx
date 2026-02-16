
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  label: string;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  label,
  placeholder = 'اختر...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCount = selectedValues.length;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="block text-[10px] text-txt-muted mb-1 font-bold">{label}</label>}
      
      <button 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[34px] px-2 py-1 bg-surface-input border rounded-lg cursor-pointer flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-primary-500/50 ${
            isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-border-subtle hover:border-border-highlight'
        }`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
            {selectedCount === 0 ? (
                <span className="text-txt-muted text-xs px-1">{placeholder}</span>
            ) : selectedCount === 1 ? (
                <span className="text-txt-main text-xs font-medium px-1 truncate">
                    {options.find(o => o.value === selectedValues[0])?.label}
                </span>
            ) : (
                <span className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-2 py-0.5 rounded text-xs font-bold">
                    {selectedCount} محدد
                </span>
            )}
        </div>
        <ChevronDown size={14} className={`text-txt-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 glass-card z-50 overflow-hidden animate-fade-in-down shadow-2xl bg-surface-card border border-border-subtle rounded-xl">
            <div className="p-2 border-b border-border-subtle bg-surface-overlay">
                <div className="relative">
                    <Search size={12} className="absolute top-1/2 right-2 -translate-y-1/2 text-txt-muted" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="بحث..."
                        className="w-full text-xs pl-2 pr-7 py-1.5 border border-border-subtle rounded-md outline-none focus:border-primary-500 bg-surface-input text-txt-main placeholder-txt-muted"
                        autoFocus
                    />
                </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto custom-scrollbar p-1" role="listbox">
                <div 
                    onClick={() => onChange([])}
                    className="px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer mb-1 flex items-center gap-2 transition-colors font-bold"
                    role="option"
                    aria-selected={false}
                >
                    <X size={12} />
                    مسح الاختيارات
                </div>
                {filteredOptions.length === 0 ? (
                    <div className="text-center py-4 text-txt-muted text-xs italic">لا توجد نتائج</div>
                ) : (
                    filteredOptions.map(opt => {
                        const isSelected = selectedValues.includes(opt.value);
                        return (
                            <div 
                                key={opt.value}
                                onClick={() => handleToggleOption(opt.value)}
                                className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs cursor-pointer transition-colors mb-0.5 ${
                                    isSelected ? 'bg-primary-500/20 text-primary-300' : 'hover:bg-surface-overlay text-txt-secondary'
                                }`}
                                role="option"
                                aria-selected={isSelected}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-primary-600 border-primary-600' : 'border-txt-muted bg-transparent'
                                }`}>
                                    {isSelected && <Check size={10} className="text-white" />}
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="font-bold truncate">{opt.label}</span>
                                    {opt.subLabel && <span className="text-[10px] opacity-70 font-mono">{opt.subLabel}</span>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      )}
    </div>
  );
};
