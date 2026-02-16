
import React from 'react';
import { Check, ShieldCheck, Database, Layers, Activity, X, AlertCircle } from 'lucide-react';
import { useImportWizard, Step } from '../../hooks/useImportWizard';
import { ImportMode, DataSourceConfigItem } from '../../../../types';

import { StepIdentity } from './wizard/StepIdentity';
import { StepUpload } from './wizard/StepUpload';
import { StepApiConnection } from './wizard/StepApiConnection';
import { StepMapping } from './wizard/StepMapping';
import { StepNormalization } from './wizard/StepNormalization';
import { StepSummary } from './wizard/StepSummary';

interface ImportWizardProps {
  mode?: ImportMode;
  targetEntityId?: string;
  initialSource?: DataSourceConfigItem;
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS_CONFIG: { id: Step; label: string; icon: any }[] = [
    { id: 'identity', label: '1. الهوية', icon: ShieldCheck },
    { id: 'ingestion', label: '2. الجلب', icon: Database },
    { id: 'mapping', label: '3. الربط والذاكرة', icon: Layers },
    { id: 'normalization', label: '4. المعايرة والنزاهة', icon: Activity },
    { id: 'summary', label: '5. التثبيت', icon: Check }
];

export const ImportWizard: React.FC<ImportWizardProps> = ({ mode = 'transactions', targetEntityId, initialSource, onComplete, onCancel }) => {
    const wizard = useImportWizard(mode as ImportMode, targetEntityId, initialSource, onComplete);
    const { currentStep, setCurrentStep, sourceType, isProcessing, errors } = wizard;

    return (
        <div className="flex flex-col h-full bg-surface-app rounded-[2.5rem] overflow-hidden border border-border-subtle shadow-2xl animate-fade-in relative">
            {/* Background Texture for Wizard */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

            {/* Progress Bar (The 6 Stages Constitution) */}
            <div className="bg-surface-card px-10 py-6 border-b border-border-subtle flex items-center justify-between no-print z-10 relative backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/20">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black text-txt-main uppercase tracking-tight">معالج دستور البيانات الموحد</h2>
                        <span className="text-[10px] text-txt-muted font-bold">Standard Integrity Wizard v2.0</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 hidden md:flex">
                    {STEPS_CONFIG.map((step, idx) => {
                        const isActive = currentStep === step.id;
                        const isDone = STEPS_CONFIG.findIndex(s => s.id === currentStep) > idx;
                        return (
                            <React.Fragment key={step.id}>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/20 shadow-sm' : isDone ? 'text-emerald-400' : 'text-txt-muted'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-primary-600 text-white' : isDone ? 'bg-emerald-500/20' : 'bg-surface-input'}`}>
                                        {isDone ? <Check size={12} strokeWidth={4} /> : idx + 1}
                                    </div>
                                    <span className="text-[10px] font-black whitespace-nowrap hidden lg:block uppercase tracking-wider">{step.label}</span>
                                </div>
                                {idx < STEPS_CONFIG.length - 1 && <div className="w-4 h-px bg-border-subtle mx-1"></div>}
                            </React.Fragment>
                        );
                    })}
                </div>

                <button onClick={onCancel} className="text-txt-muted hover:text-red-400 transition-colors p-2 hover:bg-surface-input rounded-xl"><X size={20}/></button>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar z-10 relative">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    {errors.length > 0 && (
                        <div className="mb-6 bg-red-500/10 border-r-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-shake border-t border-b border-l border-red-500/20">
                            <AlertCircle size={20} className="text-red-500" />
                            <span className="text-xs font-bold text-red-300">{errors[0]}</span>
                        </div>
                    )}

                    <div className="flex-1">
                        {currentStep === 'identity' && (
                            <StepIdentity 
                                label={wizard.sourceLabel} onLabelChange={wizard.setSourceLabel}
                                strategy={wizard.updateStrategy} onStrategyChange={wizard.setUpdateStrategy}
                                sourceType={sourceType} onSourceTypeChange={wizard.setSourceType}
                                targetMode={wizard.targetMode} onTargetModeChange={wizard.setTargetMode}
                                existingSourceId={wizard.existingSourceId} onExistingSourceChange={wizard.setExistingSourceId}
                                existingSources={wizard.existingSources}
                                onNext={() => setCurrentStep('ingestion')}
                                importProfiles={wizard.importProfiles}
                                onLoadProfile={wizard.loadProfile}
                            />
                        )}

                        {currentStep === 'ingestion' && (
                            sourceType === 'file' ? (
                                <StepUpload 
                                    onFileSelect={wizard.handleFileSelect}
                                    onCancel={() => setCurrentStep('identity')}
                                />
                            ) : (
                                <StepApiConnection 
                                    initialConfig={wizard.apiConfig}
                                    onSuccess={(data, config) => {
                                        wizard.setApiConfig(config);
                                        if (data.length > 0) {
                                            wizard.setImportResult({
                                                columns: Object.keys(data[0]),
                                                rawRows: data.slice(0, 50),
                                                allRowsCount: data.length,
                                                fileName: 'API Data',
                                                detectedMeta: { format: 'xlsx' }
                                            });
                                            setCurrentStep('mapping');
                                        }
                                    }}
                                    onCancel={() => setCurrentStep('identity')}
                                />
                            )
                        )}

                        {currentStep === 'mapping' && (
                            <StepMapping 
                                mapping={wizard.mapping} setMapping={wizard.setMapping}
                                columns={wizard.importResult?.columns || []}
                                mode={mode} targetEntityId={targetEntityId}
                                primaryKey={wizard.primaryKey} setPrimaryKey={wizard.setPrimaryKey}
                                updateStrategy={wizard.updateStrategy}
                                targetMode={wizard.targetMode}
                                onSave={wizard.runValidation} onBack={() => setCurrentStep('ingestion')}
                                isProcessing={isProcessing}
                                errors={errors}
                                sourceLabel={wizard.sourceLabel}
                                onSourceLabelChange={wizard.setSourceLabel}
                                sampleRow={wizard.importResult?.rawRows[0]}
                            />
                        )}

                        {currentStep === 'normalization' && (
                            <StepNormalization 
                                stats={wizard.stats}
                                onCommit={wizard.applyFinal}
                                onBack={() => setCurrentStep('mapping')}
                                onDownloadRejects={wizard.downloadRejects}
                                isProcessing={isProcessing}
                            />
                        )}

                        {currentStep === 'summary' && (
                            <StepSummary 
                                stats={wizard.stats} sourceLabel={wizard.sourceLabel}
                                onFinish={onComplete}
                                onSaveProfile={wizard.saveAsProfile}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
