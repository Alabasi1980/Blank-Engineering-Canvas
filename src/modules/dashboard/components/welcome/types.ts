
import React from 'react';

export type ModuleId = 'concept' | 'setup' | 'logic' | 'workflow' | 'analytics' | 'certification';

export interface GuideModuleConfig {
    id: ModuleId;
    title: string;
    icon: React.ElementType;
    color: string;
    summary: string;
    component: React.FC<ModuleContentProps>;
}

export interface ModuleContentProps {
    onAction?: (target: 'dashboard' | 'settings' | 'system_settings') => void;
}
