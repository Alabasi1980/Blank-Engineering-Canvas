
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
        const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
        if (highlightedElement) {
            highlightedElement.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [highlightedIndex, isOpen]);

  // Focus input when opening
  useEffect(() => {
      if (isOpen && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex(prev => (prev + 1) % filteredOptions.length);
            break;
        case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
            break;
        case 'Enter':
            e.preventDefault();
            if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[highlightedIndex].value);
            }
            break;
        case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            break;
        case 'Tab':
            setIsOpen(false);
            break;
    }
  };

  const handleSelect = (val: string) => {
      onChange(val);
      setIsOpen(false);
      setSearchTerm('');
  };

  const selectedOption = options.find(opt => opt.value === value);

  // Helper to highlight text match
  const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
      if (!highlight.trim()) return <span>{text}</span>;
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return (
          <span>
              {parts.map((part, i) => 
                  part.toLowerCase() === highlight.toLowerCase() 
                  ? <span key={i} className="bg-primary-500/20 text-primary-400 font-bold">{part}</span> 
                  : part
              )}
          </span>
      );
  };

  return (
    <div className="relative w-full" ref={wrapperRef} onKeyDown={handleKeyDown}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[38px] flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
          disabled ? 'bg-surface-input opacity-50 border-border-subtle cursor-not-allowed text-txt-muted' : 
          isOpen ? 'bg-surface-card border-primary-500 ring-1 ring-primary-500/20 text-txt-main' : 'bg-surface-input border-border-subtle text-txt-secondary hover:border-border-highlight hover:bg-surface-overlay'
        }`}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={`truncate select-none ${!selectedOption ? 'text-txt-muted' : 'text-txt-main font-bold'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
            {value && !disabled && (
                <div 
                    onClick={(e) => { e.stopPropagation(); onChange(''); }}
                    className="p-0.5 hover:bg-red-500/10 rounded-full text-txt-muted hover:text-red-400 transition-colors"
                >
                    <X size={12} />
                </div>
            )}
            <ChevronDown size={14} className={`text-txt-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-400' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full min-w-[240px] glass-card rounded-xl shadow-2xl border border-border-highlight overflow-hidden animate-fade-in-down bg-surface-card">
          <div className="p-2 border-b border-border-subtle bg-surface-overlay">
            <div className="relative">
              <Search size={14} className="absolute top-1/2 right-2 -translate-y-1/2 text-txt-muted" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-2 pr-7 py-1.5 text-xs border border-border-subtle rounded-lg outline-none focus:border-primary-500 bg-black/20 text-txt-main placeholder-txt-muted transition-colors"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <div ref={listRef} className="max-h-56 overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-txt-muted italic">لا توجد نتائج مطابقة</div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = value === opt.value;
                const isHighlighted = index === highlightedIndex;

                return (
                    <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2.5 text-xs cursor-pointer flex justify-between items-center transition-colors rounded-lg mb-0.5 ${
                        isHighlighted ? 'bg-surface-overlay' : 'bg-transparent'
                    } ${isSelected ? 'bg-primary-500/10' : ''}`}
                    >
                    <div className="flex flex-col gap-0.5">
                        <span className={`font-bold ${isSelected ? 'text-primary-400' : 'text-txt-secondary'}`}>
                            <HighlightText text={opt.label} highlight={searchTerm} />
                        </span>
                        {opt.subLabel && (
                            <span className="text-[9px] text-txt-muted font-mono">
                                <HighlightText text={opt.subLabel} highlight={searchTerm} />
                            </span>
                        )}
                    </div>
                    {isSelected && <Check size={14} className="text-primary-500" />}
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
