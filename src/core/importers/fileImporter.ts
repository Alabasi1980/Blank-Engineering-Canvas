
import Papa from 'papaparse';
import { FileParseOptions } from '../../types';

export interface ImportResult {
  columns: string[];
  rawRows: Record<string, any>[]; // The first 50 rows for preview OR all rows if final parse
  allRowsCount: number;
  fileName: string;
  sheets?: string[]; // For XLSX
  detectedMeta: {
      format: "csv" | "xlsx";
      delimiter?: string;
      encoding?: string;
      sheetName?: string;
  };
}

export const parseDataFile = async (
    file: File, 
    options: FileParseOptions,
    previewOnly: boolean = true
): Promise<ImportResult> => {
    
    // 1. Handle CSV
    if (options.format === 'csv') {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                encoding: options.encoding || 'UTF-8',
                delimiter: options.delimiter || '', // Auto-detect if empty
                preview: previewOnly ? 50 : 0, // 0 means all rows
                complete: (results) => {
                    // Papa parse errors can be non-fatal, but if no data and errors, reject
                    if (results.errors.length > 0 && (!results.data || results.data.length === 0)) {
                        reject(new Error(`CSV Parse Error: ${results.errors[0].message}`));
                        return;
                    }
                    resolve({
                        columns: results.meta.fields || [],
                        rawRows: results.data as Record<string, any>[],
                        allRowsCount: previewOnly ? (results.meta.cursor ? -1 : results.data.length) : results.data.length, // approximate if preview
                        fileName: file.name,
                        detectedMeta: {
                            format: 'csv',
                            delimiter: results.meta.delimiter,
                            encoding: options.encoding
                        }
                    });
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    // 2. Handle XLSX (Lazy Loaded)
    if (options.format === 'xlsx') {
        // Dynamically import xlsx only when needed
        const XLSX = await import('xlsx');
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const sheets = workbook.SheetNames;
                    if (sheets.length === 0) throw new Error("Excel file is empty");

                    const targetSheetName = options.sheetName && sheets.includes(options.sheetName) 
                        ? options.sheetName 
                        : sheets[0];

                    const worksheet = workbook.Sheets[targetSheetName];
                    
                    // Standard header parsing
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length === 0) {
                        resolve({ columns: [], rawRows: [], allRowsCount: 0, fileName: file.name, sheets, detectedMeta: { format: 'xlsx', sheetName: targetSheetName } });
                        return;
                    }

                    // Assume first row is header
                    const headers = jsonData[0] as string[];
                    const rows = jsonData.slice(1);
                    
                    // Convert to Record<string, any>
                    const mappedRows = rows.map((row: any) => {
                        const obj: Record<string, any> = {};
                        headers.forEach((h, i) => {
                            if (h) obj[h] = row[i];
                        });
                        return obj;
                    });

                    // Limit for preview
                    const finalRows = previewOnly ? mappedRows.slice(0, 50) : mappedRows;

                    resolve({
                        columns: headers.filter(h => !!h),
                        rawRows: finalRows,
                        allRowsCount: rows.length,
                        fileName: file.name,
                        sheets: sheets,
                        detectedMeta: {
                            format: 'xlsx',
                            sheetName: targetSheetName
                        }
                    });

                } catch (err: any) {
                    reject(new Error("Excel Parse Error: " + err.message));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsArrayBuffer(file);
        });
    }

    throw new Error("Unsupported format");
};
