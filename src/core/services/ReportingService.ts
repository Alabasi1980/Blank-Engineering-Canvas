import { ReportSnapshot, BrandingConfig, TableSchema, Transaction } from '../../types';
import { ExportService } from './ExportService';
import { PersistenceService } from './PersistenceService';

/**
 * ReportingService
 * Handles data freezing (Snapshots) and high-fidelity output generation.
 */
export const ReportingService = {
    /**
     * Captures a frozen state of a dashboard's metrics.
     */
    async createSnapshot(data: Omit<ReportSnapshot, 'id' | 'capturedAt'>): Promise<ReportSnapshot> {
        const snapshotsResult = await PersistenceService.getConfig('system:snapshots');
        const history: ReportSnapshot[] = snapshotsResult?.data || [];

        const newSnapshot: ReportSnapshot = {
            ...data,
            id: `snap_${Date.now()}`,
            capturedAt: new Date().toISOString()
        };

        const updatedHistory = [newSnapshot, ...history].slice(0, 50); // Keep last 50 snapshots
        await PersistenceService.saveConfig('system:snapshots', updatedHistory);
        
        return newSnapshot;
    },

    /**
     * Generates a formatted Excel report with full corporate branding.
     */
    generateOfficialReport(
        data: any[], 
        title: string, 
        branding: BrandingConfig, 
        appliedFilters: Record<string, any>,
        resolver: Function
    ) {
        // 1. Prepare Metadata rows for the Excel header
        const filterSummary = Object.entries(appliedFilters)
            .filter(([k, v]) => !['dateFrom', 'dateTo'].includes(k) && Array.isArray(v) && v.length > 0)
            .map(([k, v]) => `${k}: ${(v as any[]).length}`)
            .join(' | ');

        const metaRows = [
            [branding.companyName],
            [title],
            [`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`],
            [`الفلاتر المطبقة: ${filterSummary || 'لا يوجد'}`],
            [''] // Spacer
        ];

        // 2. Delegate to generic ExportService for file generation
        ExportService.exportExcel(data, title, branding, `EIS_Report_${title.replace(/\s+/g, '_')}`);
    }
};