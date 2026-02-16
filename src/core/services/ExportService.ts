import * as XLSX from 'xlsx';
import { Transaction, TableSchema, BrandingConfig } from '../../types';

export const ExportService = {
    exportExcel(data: any[], title: string, branding: BrandingConfig, filename?: string) {
        const wb = XLSX.utils.book_new();
        const header = [[branding.companyName], [title], [new Date().toLocaleString('ar-SA')], ['']];
        const tableKeys = data.length > 0 ? Object.keys(data[0]) : [];
        const fullData = [...header, tableKeys, ...data.map(obj => tableKeys.map(key => obj[key]))];
        const ws = XLSX.utils.aoa_to_sheet(fullData);
        
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(tableKeys.length - 1, 1) } }];
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, `${filename || title}_${new Date().toISOString().slice(0,10)}.xlsx`);
    },

    prepareDetailsForExport(details: any[], resolver: Function, schema?: TableSchema) {
        return details.map(item => {
            const tx = item.transaction;
            const row: any = { 'التاريخ': tx.date, 'المبلغ': tx.amount, 'المعالج': item.calculatedValue };
            if (schema) {
                schema.columnSettings.forEach(col => {
                    const val = (tx as any)[col.id] || tx.attributes?.[col.id] || '';
                    row[col.labelOverride || col.id] = resolver(col.id, val);
                });
            }
            return row;
        });
    }
};