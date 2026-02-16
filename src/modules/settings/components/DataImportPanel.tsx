
import React, { useState } from 'react';
import { useCompany } from '../../../context/CompanyContext';
import { DataSourceConfigItem } from '../../../types';
import { DataSourceList } from './import/DataSourceList';
import { ImportWizard } from './import/ImportWizard';
import { Database, FileSpreadsheet } from 'lucide-react';
import { SettingsSectionHeader } from './system/SettingsSectionHeader';
import { SettingHelpBlock } from './system/SettingHelpBlock';
import { GenericGuideModal } from './system/GenericGuideModal';

export const DataImportPanel: React.FC = () => {
  const { config, updateConfig } = useCompany();
  const [mode, setMode] = useState<'list' | 'wizard'>('list');
  const [editingSource, setEditingSource] = useState<DataSourceConfigItem | undefined>(undefined);
  const [showHelp, setShowHelp] = useState(false);

  // --- Handlers ---

  const handleStartAdd = () => {
    setEditingSource(undefined);
    setMode('wizard');
  };

  const handleStartEdit = (source: DataSourceConfigItem) => {
    setEditingSource(source);
    setMode('wizard');
  };

  const handleSetDefault = (id: string) => {
    updateConfig({ defaultDataSourceId: id });
  };

  const handleWizardComplete = () => {
    setMode('list');
    setEditingSource(undefined);
  };

  const handleWizardCancel = () => {
    setMode('list');
    setEditingSource(undefined);
  };

  if (mode === 'wizard') {
    return (
      <ImportWizard 
        initialSource={editingSource}
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in pb-10">
        <SettingsSectionHeader 
            title="إدارة مصادر وحاويات البيانات (Data Containers)"
            description="مركز التحكم بتدفق البيانات. يمكنك هنا إنشاء 'حاويات' مستقلة لكل نوع من البيانات (مثلاً حاوية للمبيعات، حاوية للمصاريف)، واستيراد الملفات إليها، أو معاينة محتوياتها."
            icon={FileSpreadsheet}
            bgClass="bg-green-100"
            iconColorClass="text-green-600"
        />

        <div className="flex-1 overflow-y-auto">
            <DataSourceList 
              dataSources={config.dataSources}
              defaultDataSourceId={config.defaultDataSourceId}
              onAdd={handleStartAdd}
              onEdit={handleStartEdit}
              onSetDefault={handleSetDefault}
            />
        </div>

        <div className="shrink-0">
            <SettingHelpBlock 
                title="نظام الحاويات (Containers)"
                description="النظام لا يخلط البيانات ببعضها. كل 'مصدر' تنشئه هنا يعمل كحاوية مستقلة لها هيكلها الخاص وقالبها الخاص. يمكنك تحميل قالب Excel المخصص لكل حاوية لضمان تطابق البيانات."
                onClick={() => setShowHelp(true)}
                color="emerald"
            />
        </div>

        <GenericGuideModal title="دليل إدارة حاويات البيانات" isOpen={showHelp} onClose={() => setShowHelp(false)}>
            <section>
                <h3 className="text-lg font-bold text-txt-main mb-2">1. مفهوم الحاويات</h3>
                <p className="text-sm text-txt-secondary leading-relaxed">
                    فكر في "المصدر" كأنه "ملف" في أرشيفك. يمكنك إنشاء مصدر اسمه "مبيعات 2024" ورفع ملفات شهرية إليه (يناير، فبراير...). 
                    <br/>
                    عندما تصمم لوحة القيادة، يمكنك توجيه كل بطاقة لقراءة البيانات من حاوية محددة.
                </p>
            </section>
            <section>
                <h3 className="text-lg font-bold text-txt-main mb-2">2. معاينة وتدقيق البيانات</h3>
                <p className="text-sm text-txt-secondary leading-relaxed">
                    لكل حاوية زر "معاينة" (العدسة) يسمح لك برؤية الجدول الكامل للبيانات المخزنة بداخلها، والتأكد من صحتها، أو حتى تنزيلها كملف Excel للمراجعة.
                </p>
            </section>
            <section>
                <h3 className="text-lg font-bold text-txt-main mb-2">3. القوالب المخصصة</h3>
                <p className="text-sm text-txt-secondary leading-relaxed">
                    لا تتعب نفسك في تصميم ملف Excel من الصفر. اضغط على زر "القالب" في أي حاوية، وسيقوم النظام بتوليد ملف Excel جاهز يحتوي بالضبط على الأعمدة المطلوبة لهذه الحاوية.
                </p>
            </section>
        </GenericGuideModal>
    </div>
  );
};
