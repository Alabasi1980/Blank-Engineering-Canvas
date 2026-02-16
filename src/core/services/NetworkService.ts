import { ApiConfig } from '../../types';

export const NetworkService = {
    async fetch(config: ApiConfig, overrideHeaders: Record<string, string> = {}, lastSyncDate?: string): Promise<any[]> {
        let url = config.endpointUrl.replace(/\{\{last_sync_date\}\}/g, lastSyncDate || '1970-01-01');
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...config.headers,
            ...overrideHeaders
        };

        if (config.authType === 'bearer') headers['Authorization'] = `Bearer ${config.authToken}`;
        else if (config.authType === 'basic') headers['Authorization'] = `Basic ${config.authToken}`;

        const response = await fetch(url, { method: config.method, headers });
        if (!response.ok) throw new Error(`Network Error: ${response.status}`);

        const json = await response.json();
        let data = json;
        if (config.dataKey) {
            config.dataKey.split('.').forEach(k => { if (data) data = data[k]; });
        }
        if (!Array.isArray(data)) throw new Error("API response is not an array");
        return data;
    }
};