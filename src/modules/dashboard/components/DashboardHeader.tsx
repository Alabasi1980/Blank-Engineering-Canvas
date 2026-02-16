
import React from 'react';
import { useCompany } from '../../../context/CompanyContext';
import { BrandingConfig } from '../../../types';
import { SnapshotToolbar } from './SnapshotToolbar';

interface DashboardHeaderProps {
  companyConfig: BrandingConfig;
  onOpenGuide: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  companyConfig,
  onOpenGuide
}) => {
  const { config } = useCompany();
  
  return (
    <div className="bg-surface-overlay/50 backdrop-blur-md border-b border-border-subtle px-8 py-5 dashboard-header relative z-50 shadow-lg">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex items-center gap-4">
             <div 
                className="p-3 rounded-2xl shadow-inner border"
                style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--color-primary), transparent 85%)',
                    borderColor: 'color-mix(in srgb, var(--color-primary), transparent 70%)',
                    color: 'var(--color-primary)'
                }}
             >
                <span className="text-xl font-black">{companyConfig.companyName.charAt(0).toUpperCase()}</span>
             </div>
             <div>
                <h1 className="text-2xl font-black text-txt-main tracking-tight">{companyConfig.reportHeader}</h1>
                <p className="text-xs text-txt-muted font-bold uppercase tracking-widest mt-0.5">{companyConfig.companyName}</p>
             </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto no-print">
            <SnapshotToolbar dashboardId={config.dashboards[0]?.id || 'default'} />
            
            <div className="flex items-center bg-surface-input p-1.5 rounded-2xl border border-border-subtle shadow-inner group">
                {/* Optional: Add date range display or other summary info here */}
            </div>
            
            <button 
                onClick={onOpenGuide}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary), transparent 90%)',
                    color: 'var(--color-primary)',
                    borderColor: 'color-mix(in srgb, var(--color-primary), transparent 80%)'
                }}
            >
                دليل الاستخدام
            </button>
        </div>
      </div>
    </div>
  );
};
