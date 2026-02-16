
import React, { useRef, useState } from 'react';
import { Plus, CreditCard, ChevronLeft, Trash2, GripVertical, List, Layers } from 'lucide-react';
import { MainCard } from '../../../types';
import { CARD_COLORS } from '../../../constants';
import { EmptyState } from '../../../shared/components/EmptyState';

interface MainCardListProps {
  mainCards: MainCard[];
  activeMainCardId: string | null;
  onSelect: (id: string) => void;
  onAdd?: () => void;
  onDelete?: (id: string) => void;
  onReorder?: (newOrder: MainCard[]) => void;
}

export const MainCardList: React.FC<MainCardListProps> = ({ 
  mainCards, 
  activeMainCardId, 
  onSelect,
  onAdd,
  onDelete,
  onReorder
}) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cards = mainCards || [];

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || !onReorder) return;
    
    const _cards = [...cards];
    const draggedItemContent = _cards[dragItem.current];
    
    _cards.splice(dragItem.current, 1);
    _cards.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);

    onReorder(_cards);
  };

  return (
    <div className={`w-80 border-l border-border-subtle flex flex-col overflow-y-auto transition-all duration-300 bg-surface-sidebar backdrop-blur-md ${activeMainCardId ? 'hidden lg:flex' : 'flex-1'}`}>
      <div className="p-4 border-b border-border-subtle bg-surface-overlay flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-txt-secondary">
           <List size={18} />
           <span className="font-bold">المجموعات</span>
        </div>
        <button 
          type="button"
          onClick={onAdd}
          className="text-txt-onBrand bg-primary-600 hover:bg-primary-500 p-1.5 rounded-lg transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          title="إضافة مجموعة جديدة"
          disabled={!onAdd}
        >
          <Plus size={18} />
        </button>
      </div>
      
      <div className="p-3 space-y-2 flex-1">
        {cards.length > 0 ? (
            cards.map((card, index) => {
            const theme = CARD_COLORS.find(c => c.value === card.color) || CARD_COLORS[0];
            const isActive = activeMainCardId === card.id;

            return (
                <div 
                key={card.id}
                onClick={() => onSelect(card.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative flex items-center gap-3 ${
                    isActive
                    ? `border-${theme.value}-500/50 bg-${theme.value}-500/10` 
                    : 'border-border-subtle bg-surface-card hover:bg-surface-overlay hover:border-border-highlight'
                } ${isDragging && dragItem.current === index ? 'opacity-40 dashed border-2 border-primary-400' : ''}`}
                draggable={!!onReorder}
                onDragStart={() => {
                    dragItem.current = index;
                    setIsDragging(true);
                }}
                onDragEnter={() => {
                    dragOverItem.current = index;
                }}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                >
                {/* Drag Handle */}
                {onReorder && (
                    <div className="text-txt-muted hover:text-txt-secondary cursor-move" onClick={(e) => e.stopPropagation()}>
                        <GripVertical size={16} />
                    </div>
                )}

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isActive ? `bg-surface-overlay ${theme.text} shadow-sm` : 'bg-surface-input text-txt-muted'}`}>
                    <CreditCard size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${isActive ? 'text-txt-main' : 'text-txt-secondary'}`}>{card.title}</h3>
                    <p className="text-[10px] text-txt-muted truncate">
                        {card.subCards.length} بطاقات
                    </p>
                </div>
                
                {isActive ? (
                    <ChevronLeft size={16} className={`${theme.text}`} />
                ) : onDelete ? (
                    <button 
                        type="button"
                        onClick={(e) => {
                        e.stopPropagation();
                        onDelete(card.id);
                        }}
                        className="p-1.5 text-txt-muted hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                ) : null}
                </div>
            );
            })
        ) : (
            <EmptyState 
                icon={Layers}
                title="القائمة فارغة"
                description="ابدأ بإضافة مجموعات لتنظيم البطاقات بداخلها."
                className="!min-h-[300px] !p-4 bg-surface-card border-dashed border border-border-subtle rounded-2xl"
                action={onAdd ? {
                    label: 'إضافة مجموعة',
                    onClick: onAdd,
                    icon: <Plus size={14} />
                } : undefined}
            />
        )}
      </div>
    </div>
  );
};
