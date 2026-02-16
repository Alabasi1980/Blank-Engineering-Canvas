import { DashboardLayout, MainCard, SubCard } from '../../types';

export const DashboardService = {
    createDashboard(title: string, icon: string): DashboardLayout {
        return { 
            id: crypto.randomUUID(), 
            title, 
            icon, 
            mainCards: [],
            defaultDataSourceId: undefined
        };
    },

    createMainCard(title: string, color: string = 'slate'): MainCard {
        return { id: crypto.randomUUID(), title, color, subCards: [] };
    },

    createSubCard(title: string, color: string): SubCard {
        return {
            id: crypto.randomUUID(),
            title,
            description: 'وصف جديد...',
            dataType: 'decimal_value',
            type: 'metric',
            color,
            rules: []
        };
    },

    duplicateSubCard(original: SubCard): SubCard {
        return {
            ...JSON.parse(JSON.stringify(original)),
            id: crypto.randomUUID(),
            title: `${original.title} (نسخة)`,
            rules: original.rules.map(r => ({ ...r, id: crypto.randomUUID() }))
        };
    }
};