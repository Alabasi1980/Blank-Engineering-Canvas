
import { CompanyConfig } from '../types';

/**
 * The Absolute Zero State.
 * No dashboards, no dimensions, no logic.
 * The system is a 'Blank Canvas' until the user defines their domain.
 */
export const defaultCompanyConfig: CompanyConfig = {
  branding: {
    companyName: "نظام جديد",
    reportHeader: "تقرير تنفيذي",
    systemUser: "مدير النظام",
    userEmail: "admin@system.local",
    sidebarColor: "#0f172a",
    reportPrefix: "SYS-",
    reportFooter: "تم التوليد بواسطة محرك الذكاء التنفيذي",
    dateFormat: "YYYY-MM-DD",
    numberFormat: "standard",
    // Default Theme: Deep Purple Void
    theme: {
        mode: 'dark',
        primaryColor: '#6366f1', // Indigo/Purple
        secondaryColor: '#d946ef', // Fuchsia
        backgroundColor: '#0f0518', // Deep Purple Void
        surfaceColor: 'rgba(30, 20, 50, 0.65)',
        fontFamily: 'Cairo',
        radius: 'lg'
    }
  },
  systemConstants: {},
  settings: {
      ingestion: {
          autoDetectCoreFields: true
      }
  },
  schema: {
      fields: [] 
  },
  logicRegistry: {
      activeFormulaId: '',
      formulas: [],
      variables: [],
      directionDimensionId: '',
      directionLogic: {}
  },
  terminology: {},
  dimensionsRegistry: [],
  definitions: {
      importAliases: [
          { fieldId: 'date', keywords: ['التاريخ', 'تاريخ', 'date', 'day'] },
          { fieldId: 'amount', keywords: ['القيمة', 'المبلغ', 'amount', 'total', 'value'] },
          { fieldId: 'description', keywords: ['البيان', 'الوصف', 'description', 'desc'] },
          { fieldId: 'sourceRef', keywords: ['المرجع', 'رقم', 'ref', 'reference'] }
      ]
  },
  dashboards: [], 
  dataSources: [], 
  defaultDataSourceId: "", 
  integrationProfiles: [], 
  importProfiles: [], 
  masterEntities: [], 
  tableSchemas: []
};
