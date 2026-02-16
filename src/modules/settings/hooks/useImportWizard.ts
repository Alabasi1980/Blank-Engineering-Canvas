import { useState } from 'react';
import { ImportMapping, DataSourceConfigItem, ApiConfig, UpdateStrategy, ImportMode, AnalysisStats, ImportResult } from '../../../types';
import { parseDataFile } from '../../../core/importers/fileImporter';
import { ImportService } from '../../../core/services/ImportService';
import { NetworkService } from '../../../core/services/NetworkService';
import { useCompany } from '../../../context/CompanyContext';
import { useData } from '../../../core/context/DataContext';
import { useUI } from '../../../context/UIContext';
import * as XLSX from 'xlsx';

// Fix: Export AnalysisStats and ImportStats for step components
export type { AnalysisStats, AnalysisStats as ImportStats };
export type Step = 'identity' | 'ingestion' | 'mapping' | 'normalization' | 'summary';

export const useImportWizard = (mode: ImportMode = 'transactions', targetEntityId?: string, initialSource?: DataSourceConfigItem, onComplete?: () => void) => {
    const { config, updateConfig } = useCompany();
    const { saveDataset, datasets } = useData();
    const { showToast } = useUI();

    const [currentStep, setCurrentStep] = useState<Step>('identity');
    const [targetMode, setTargetMode] = useState<'new' | 'existing'>(initialSource ? 'existing' : 'new');
    const [existingSourceId, setExistingSourceId] = useState(initialSource?.id || '');
    const [newLabel, setNewLabel] = useState('');
    const [sourceType, setSourceType] = useState<'file' | 'api'>(initialSource?.type === 'api' ? 'api' : 'file');
    const [strategy, setStrategy] = useState<UpdateStrategy>('upsert');
    const [primaryKey, setPrimaryKey] = useState<string[]>(initialSource?.primaryKeyField ? (Array.isArray(initialSource.primaryKeyField) ? initialSource.primaryKeyField : [initialSource.primaryKeyField]) : []);
    const [file, setFile] = useState<File | null>(null);
    const [mapping, setMapping] = useState<Partial<ImportMapping>>(initialSource?.mapping || {});
    const [analysis, setAnalysis] = useState<AnalysisStats | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [apiConfig, setApiConfig] = useState<ApiConfig>(initialSource?.apiConfig || { endpointUrl: '', method: 'GET', authType: 'none' });

    const handleFileSelect = async (f: File) => {
        setFile(f); setIsProcessing(true);
        try {
            const res = await parseDataFile(f, { format: f.name.endsWith('.csv') ? 'csv' : 'xlsx' }, true);
            setImportResult(res);
            setCurrentStep('mapping');
        } catch (e: any) { showToast(e.message, 'error'); }
        finally { setIsProcessing(false); }
    };

    const runAnalysis = async () => {
        setIsProcessing(true);
        setErrors([]);
        try {
            const raw = sourceType === 'file' ? (await parseDataFile(file!, { format: 'xlsx' }, false)).rawRows : await NetworkService.fetch(apiConfig);
            const normalized = ImportService.normalize(raw, mapping);
            if (normalized.length === 0) throw new Error("لا توجد بيانات صالحة للاستيراد بعد المطابقة.");
            
            const existing = datasets[existingSourceId] || [];
            const stats = ImportService.analyze(normalized, existing, strategy, primaryKey);
            setAnalysis(stats);
            setCurrentStep('normalization');
        } catch (e: any) { setErrors([e.message]); }
        finally { setIsProcessing(false); }
    };

    const applyFinal = async () => {
        setIsProcessing(true);
        try {
            const finalId = targetMode === 'existing' ? existingSourceId : `src_${crypto.randomUUID().slice(0,8)}`;
            const incoming = [...(analysis?.actions.toInsert || []), ...(analysis?.actions.toUpdate || [])];
            await saveDataset(finalId, incoming, strategy, primaryKey);
            
            if (targetMode === 'new') {
                const newSource: DataSourceConfigItem = {
                    id: finalId, label: newLabel, type: sourceType, 
                    updateStrategy: strategy, primaryKeyField: primaryKey, 
                    mapping: mapping, parseOptions: { format: 'xlsx' }
                };
                updateConfig({ dataSources: [...config.dataSources, newSource] });
            }
            setCurrentStep('summary');
        } catch (e: any) { showToast(e.message, 'error'); }
        finally { setIsProcessing(false); }
    };

    const loadProfile = (id: string) => {
        const profile = config.importProfiles.find(p => p.id === id);
        if (profile) {
            setMapping(profile.mapping);
            setPrimaryKey(profile.primaryKey);
            setStrategy(profile.updateStrategy);
            if (profile.apiConfig) setApiConfig(profile.apiConfig);
        }
    };

    const saveAsProfile = (name: string) => {
        const newProfile = {
            id: crypto.randomUUID(), name, type: sourceType, mapping,
            primaryKey, updateStrategy: strategy, parseOptions: { format: 'xlsx' as const }, apiConfig
        };
        updateConfig({ importProfiles: [...(config.importProfiles || []), newProfile] });
    };

    return {
        currentStep, setCurrentStep, targetMode, setTargetMode, existingSourceId, setExistingSourceId, 
        updateStrategy: strategy, setUpdateStrategy: setStrategy,
        sourceType, setSourceType, primaryKey, setPrimaryKey, mapping, setMapping, stats: analysis, isProcessing,
        handleFileSelect, runAnalysis, applyFinal, sourceLabel: newLabel, setSourceLabel: setNewLabel,
        existingSources: config.dataSources, importProfiles: config.importProfiles || [],
        downloadRejects: () => { if(analysis?.rejectedData) XLSX.writeFile(XLSX.utils.book_new(), "Rejects.xlsx"); },
        // Fix: Added missing loadProfile to the return object
        errors, apiConfig, setApiConfig, setImportResult, importResult, runValidation: runAnalysis, saveAsProfile, loadProfile
    };
};