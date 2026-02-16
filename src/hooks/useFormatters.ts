import { useCallback } from 'react';
import { useCompany } from '../context/CompanyContext';
import { FormattingService } from '../core/services/FormattingService';

/**
 * useFormatters
 * Thin wrapper around FormattingService to inject context.
 */
export const useFormatters = () => {
  const { config } = useCompany();
  const { dateFormat, numberFormat } = config.branding;

  const formatDate = useCallback((date: Date | string): string => {
    return FormattingService.formatDate(date, dateFormat);
  }, [dateFormat]);

  const formatNumber = useCallback((num: number, options?: { compact?: boolean }): string => {
    return FormattingService.formatNumber(num, numberFormat, options);
  }, [numberFormat]);

  return { formatDate, formatNumber, dateFormat, numberFormat };
};