
import React from 'react';
import { ArrowRight, Layout, Plus } from 'lucide-react';
import { MainCard } from '../../../types';
import { MainCardSettings } from './MainCardSettings';
import { SubCardGrid } from './SubCardGrid';
import { Button } from '../../../shared/components/Button';

interface MainCardEditorProps {
  mainCard: MainCard;
  onUpdate: (updates: Partial<MainCard>) => void;
  onDelete: () => void;
  onBack: () => void;
  onAddSubCard: () => void;
  onSelectSubCard: (id: string) => void;
  onDuplicateSubCard?: (id: string) => void;
  onDeleteSubCard?: (id: string) => void;
}

export const MainCardEditor: React.FC<MainCardEditorProps> = ({
  mainCard,
  onUpdate,
  onDelete,
  onBack,
  onAddSubCard,
  onSelectSubCard,
  onDuplicateSubCard,
  onDeleteSubCard
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex items-center gap-2 mb-6 text-txt-secondary cursor-pointer lg:hidden hover:text-primary-400 transition-colors" onClick={onBack}>
        <ArrowRight size={20} />
        <span>العودة للقائمة</span>
      </div>

      <MainCardSettings 
        card={mainCard}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-txt-main flex items-center gap-2">
            <Layout size={24} className="text-txt-muted" />
            البطاقات الفرعية
          </h2>
          <p className="text-txt-secondary mt-1 text-sm">إدارة المحتوى الذي يظهر داخل هذه المجموعة</p>
        </div>
        <Button onClick={onAddSubCard} icon={<Plus size={18} />}>بطاقة فرعية جديدة</Button>
      </div>

      <SubCardGrid 
        subCards={mainCard.subCards} 
        onSelect={onSelectSubCard} 
        onAdd={onAddSubCard} 
        onDuplicate={onDuplicateSubCard}
        onDelete={onDeleteSubCard}
      />
    </div>
  );
};
