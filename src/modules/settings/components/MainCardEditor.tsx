
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
    <div className="space-y-10">
      <div className="flex items-center gap-2 text-txt-secondary cursor-pointer lg:hidden hover:text-primary-400 transition-colors mb-4" onClick={onBack}>
        <ArrowRight size={20} />
        <span>العودة للقائمة</span>
      </div>

      <MainCardSettings 
        card={mainCard}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-txt-main flex items-center gap-3">
            <Layout size={24} className="text-primary-500" />
            البطاقات والمؤشرات الفرعية
          </h2>
          <p className="text-txt-secondary mt-1 text-sm font-medium">إدارة المحتوى والقواعد التي تظهر داخل هذه المجموعة</p>
        </div>
        <Button onClick={onAddSubCard} icon={<Plus size={18} />} className="shadow-lg">بطاقة مؤشر جديدة</Button>
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
