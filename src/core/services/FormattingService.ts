import { DateFormatOptionType, NumberFormatOption } from '../../types';

/**
 * FormattingService
 * Central authority for visual data representation.
 */
export const FormattingService = {
    formatDate(date: Date | string, format: DateFormatOptionType): string {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        switch (format) {
            case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
            case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
            case 'YYYY-MM-DD': default: return `${year}-${month}-${day}`;
        }
    },

    formatNumber(num: number, format: NumberFormatOption, options?: { compact?: boolean }): string {
        if (num === undefined || num === null) return '0';
        
        const locale = format === 'european' ? 'de-DE' : 'en-US';
        const intlOptions: Intl.NumberFormatOptions = {};
        
        if (format === 'no_decimals') {
            intlOptions.minimumFractionDigits = 0;
            intlOptions.maximumFractionDigits = 0;
        } else {
            intlOptions.minimumFractionDigits = 2;
            intlOptions.maximumFractionDigits = 2;
        }

        if (options?.compact || format === 'compact') {
            intlOptions.notation = 'compact';
            intlOptions.compactDisplay = 'short';
            intlOptions.maximumFractionDigits = 1;
        }

        return new Intl.NumberFormat(locale, intlOptions).format(num);
    }
};