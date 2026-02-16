
export type AggregationType = 'sum' | 'count' | 'avg' | 'max' | 'min';
export type PivotField = string | 'none' | 'month';
export type ConditionOperator = 'in' | 'not_in' | 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
export type EffectNature = 'add' | 'subtract' | 'neutral';
export type BalanceType = 'period_balance' | 'opening_balance' | 'cumulative';
export type CardDataType = 'decimal_value' | 'integer_count';
export type UpdateStrategy = 'replace_all' | 'upsert' | 'append';
export type ImportMode = 'transactions' | 'master_data';
export type MasterFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';
export type DimensionType = 'master_data' | 'text' | 'number' | 'date' | 'list';
export type MasterDataType = string;
export type MasterEntityType = string;

export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface ImportResult {
  columns: string[];
  rawRows: Record<string, any>[];
  allRowsCount: number;
  fileName: string;
  sheets?: string[];
  detectedMeta: {
      format: "csv" | "xlsx";
      delimiter?: string;
      encoding?: string;
      sheetName?: string;
  };
}

export interface ImportAliasMap {
    fieldId: string;
    keywords: string[];
}

export interface DefinitionItem {
    id: string;
    label: string;
    isSystem?: boolean;
}

export interface SystemDefinitions {
    importAliases: ImportAliasMap[];
    [key: string]: any;
}

export type DateFormatOptionType = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'DD-MM-YYYY';
export type NumberFormatOption = 'standard' | 'european' | 'no_decimals' | 'compact';

export interface ThemeConfig {
    mode: 'dark' | 'light'; 
    primaryColor: string; 
    secondaryColor: string; 
    backgroundColor: string; 
    surfaceColor: string; 
    fontFamily: string;
    radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    texture?: 'none' | 'grid' | 'dots' | 'noise';
    blur?: number;
    soundEnabled?: boolean;
}

export interface BrandingConfig {
    companyName: string;
    reportHeader: string;
    reportSubtitle?: string;
    systemUser: string;
    userEmail: string;
    sidebarColor: string;
    reportPrefix: string;
    reportFooter: string;
    dateFormat: DateFormatOptionType;
    numberFormat: NumberFormatOption;
    logo?: string;
    theme?: ThemeConfig; 
}

export interface DimensionRestriction {
    dimensionId: string;
    allowedValues: string[];
    enforced: boolean;
}

export interface UserGroup {
    id: string;
    name: string;
    restrictions: DimensionRestriction[];
}

export interface SystemUser {
    id: string;
    name: string;
    email: string;
    role: string;
    groupId: string;
}

export interface FileParseOptions {
    format: 'csv' | 'xlsx';
    delimiter?: string;
    encoding?: string;
    sheetName?: string;
    dateFormat?: 'auto' | 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
    numberFormat?: 'auto' | 'de-DE';
}

export interface ApiConfig {
    endpointUrl: string;
    method: 'GET' | 'POST';
    authType: 'none' | 'bearer' | 'basic' | 'header';
    authToken?: string;
    dataKey?: string;
    headers?: Record<string, string>;
}

export interface ImportMapping {
    date?: string;
    amount?: string;
    description?: string;
    sourceRef?: string;
    customAttributes?: Record<string, string>;
}

export interface AnalysisStats {
    totalFileRows: number;
    newRecords: number;
    updatedRecords: number;
    identicalRecords: number;
    rejectedDuplicates: number;
    invalidRows: number;
    actions: {
        toInsert: any[];
        toUpdate: any[];
        toSkip: any[];
    };
    rejectedData: any[];
}

export interface ExchangeRate {
    code: string;
    label: string;
    rate: number;
    lastUpdated: string;
}

export interface CurrencySettings {
    baseCurrency: string;
    currencyDimensionId: string;
    exchangeRates: ExchangeRate[];
    autoConversionEnabled: boolean;
}

export interface CalculationVariable {
    id: string;
    label: string;
    sourceType: 'transaction_field' | 'custom_attribute' | 'system_constant';
    sourceKey: string;
}

export interface LogicFormula {
    id: string;
    label: string;
    description: string;
    expression: string;
    type: 'mathematical';
    scope: 'row' | 'aggregate';
}

export interface SchemaField {
    id: string;
    label: string;
    dataType: 'string' | 'number' | 'date' | 'boolean';
    isSystem: boolean;
    binding: string;
}

export interface DimensionDefinition {
    id: string;
    label: string;
    type: DimensionType;
    sourceEntityId?: string;
    sourceDimId?: string;
    transformation?: 'month_year' | 'year' | 'none';
    enabled: boolean;
    role: 'none' | 'timestamp' | 'measure';
    ui: {
        filter: boolean;
        rule: boolean;
        pivot: boolean;
        import: boolean;
    };
    importAliases?: string[];
    isSystem?: boolean;
}

export interface TableColumnSettings {
    id: string;
    labelOverride?: string;
    required: boolean;
    width?: number;
}

export interface TableSchema {
    id: string;
    name: string;
    visibleColumns: string[];
    columnSettings: TableColumnSettings[];
    isSystem: boolean;
}

export interface RuleCondition {
    dimensionId: string;
    operator: ConditionOperator;
    values: any[];
}

export interface RuleRow {
    id: string;
    order: number;
    conditions: RuleCondition[];
    balanceType: BalanceType;
    effectNature: EffectNature;
    valueBasis: string;
    enabled: boolean;
    continueProcessing?: boolean;
}

export interface AlertRule {
    id: string;
    label: string;
    operator: 'greater_than' | 'less_than' | 'equals';
    threshold: number;
    severity: 'danger' | 'warning' | 'info';
    message: string;
    enabled: boolean;
}

export interface PivotValueDef {
    id: string;
    sourceField: string;
    operation: AggregationType;
    label: string;
}

export interface DerivedMeasure {
    id: string;
    label: string;
    expression: string;
}

export interface PivotConfig {
    rowField: PivotField;
    colField: PivotField;
    values: PivotValueDef[];
    derivedMeasures?: DerivedMeasure[];
}

export interface ChartConfig {
    type: 'donut' | 'bar';
    dimension: PivotField;
    measure: 'amount' | 'count';
}

export interface SubCard {
    id: string;
    title: string;
    description: string;
    dataType: CardDataType;
    type: 'metric';
    color: string;
    rules: RuleRow[];
    unit?: string;
    annualResetMonth?: number;
    alerts?: AlertRule[];
    dataSourceId?: string;
    tableSchemaId?: string;
    defaultPivotConfig?: PivotConfig;
    showChangeFromPrevious?: boolean;
    showAnnualCumulative?: boolean;
    showCumulativeTotal?: boolean;
}

export interface MainCard {
    id: string;
    title: string;
    color: string;
    subCards: SubCard[];
}

export interface ImportBatch {
    id: string;
    importedAt: string;
    fileName: string;
    rowCount: number;
    strategy: UpdateStrategy;
    overwrittenBackup?: Transaction[];
}

export interface DataSourceConfigItem {
    id: string;
    label: string;
    type: 'file' | 'api';
    updateStrategy: UpdateStrategy;
    primaryKeyField: string | string[];
    mapping: Partial<ImportMapping>;
    parseOptions: FileParseOptions;
    apiConfig?: ApiConfig;
    importHistory?: ImportBatch[];
    lastSyncAt?: string;
    syncStatus?: 'success' | 'error';
    fileMeta?: {
        importedAt: string;
    };
}

export interface MasterEntityField {
    key: string;
    label: string;
    type: MasterFieldType;
    required: boolean;
    options?: string[];
}

export interface MasterEntityDefinition {
    id: string;
    label: string;
    hierarchy?: {
        enabled: boolean;
        parentKey: string;
        separator: string;
    };
    isTree?: boolean;
    icon: string;
    color: string;
    description?: string;
    isSystem: boolean;
    fields: MasterEntityField[];
    keyFieldLabel?: string;
    labelFieldLabel?: string;
}

export interface ImportProfile {
    id: string;
    name: string;
    type: 'file' | 'api';
    mapping: Partial<ImportMapping>;
    primaryKey: string[];
    updateStrategy: UpdateStrategy;
    parseOptions: FileParseOptions;
    apiConfig?: ApiConfig;
}

export interface IntegrationProfile {
    id: string;
    name: string;
    targetEntity: string;
    apiConfig: ApiConfig;
    fieldMapping: Record<string, string>;
    lastSyncAt?: string;
    lastSyncCount?: number;
}

export interface CustomAttribute {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    isSystem?: boolean;
}

export interface CompanyConfig {
    branding: BrandingConfig;
    systemConstants: Record<string, any>;
    settings: {
        ingestion: {
            autoDetectCoreFields: boolean;
        }
    };
    schema: {
        fields: SchemaField[];
    };
    logicRegistry: {
        activeFormulaId: string;
        formulas: LogicFormula[];
        variables: CalculationVariable[];
        directionDimensionId: string;
        directionLogic: Record<string, 'positive' | 'negative' | 'neutral'>;
    };
    terminology: {
        balanceTypes?: Record<string, string>;
        [key: string]: any;
    };
    dimensionsRegistry: DimensionDefinition[];
    definitions: SystemDefinitions;
    dashboards: DashboardLayout[];
    dataSources: DataSourceConfigItem[];
    defaultDataSourceId: string;
    integrationProfiles: IntegrationProfile[];
    importProfiles: ImportProfile[];
    masterEntities: MasterEntityDefinition[];
    tableSchemas: TableSchema[];
    currencySettings?: CurrencySettings;
    customAttributes?: CustomAttribute[];
}

export interface DashboardLayout {
    id: string;
    title: string;
    icon: string;
    mainCards: MainCard[];
    defaultDataSourceId?: string;
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    sourceRef: string;
    batchId?: string;
    attributes?: Record<string, any>;
}

export interface GenericTreeNode {
    id: string;
    name: string;
    parentId?: string;
    type?: 'header' | 'detail';
    enabled?: boolean;
    isSystem?: boolean;
    description?: string;
    [key: string]: any;
}

export interface SnapshotMetric {
    cardId: string;
    value: number;
    annualValue: number;
    cumulativeValue: number;
    trendData: number[];
}

export interface ReportSnapshot {
    id: string;
    dashboardId: string;
    name: string;
    note?: string;
    capturedAt: string;
    capturedBy: string;
    periodLabel: string;
    filtersApplied: any;
    metrics: SnapshotMetric[];
}
