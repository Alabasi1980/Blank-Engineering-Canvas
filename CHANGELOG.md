
# Change Log

All notable changes to the **Procurement Dashboard Configurator** will be documented in this file.

## [2.5.3] - 2024-05-24
### Maintenance Run #3 (Robustness & UX)
- **Safe Logic Engine:** Implemented `validateFormulaSyntax` to block invalid formulas in the Logic Architect before saving, preventing runtime crashes.
- **Enhanced Date Import:** Improved `normalizeTransactions.ts` regex to support single-digit days/months (e.g., `1/5/2024`) and various delimiters.
- **Accessibility:** Upgraded `MultiSelect` component to use proper button elements and ARIA attributes for better keyboard navigation.

## [2.5.2] - 2024-05-23
### Maintenance Run #2 (Safety & Performance)
- **Evaluator Security:** Enhanced `solveFormula` to natively support Math functions (`round`, `abs`, etc.) and sanitize input safer.
- **Tree Optimization:** Optimized `sortHierarchy` to handle large datasets efficiently and prevent UI freezes on circular references.
- **UX Polish:** Added a `Global Loading Overlay` via `UIContext` for better feedback during heavy operations.
- **Resolver Logic:** Refactored `RegistryResolvers` to ensure dynamic definitions always take precedence over hardcoded constants.

## [2.5.1] - 2024-05-22
### Maintenance & Quality
- **Code Cleanup:** Removed legacy `mockDatabase.ts` and identified unused files.
- **Persistence Layer:** Introduced `src/core/utils/persistence.ts` as a single source of truth for browser storage access.
- **Refactoring:** Updated contexts to use the new Persistence layer.

## [2.5.0] - 2024-05-21
### Features
- **Logic Architect:** Added advanced formula builder with aggregate function support.
- **Dimension Manager:** Centralized management for all data dimensions.
- **Engine Trace:** Added `TransactionInspector` for detailed logic debugging.

## [2.0.0] - 2024-05-15
### Major Architecture Update
- **Dynamic Config:** Shifted to `CompanyConfig` driven architecture.
- **Metric Engine:** Implemented `HierarchyMatcher`.
- **Import Wizard:** Added intelligent column mapping.

## [1.0.0] - Initial Release
- Basic dashboard with cards.
- Static data sources.
