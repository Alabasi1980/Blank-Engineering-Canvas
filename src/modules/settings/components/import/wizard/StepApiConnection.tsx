
import React, { useState } from 'react';
import { Globe, Lock, Code, Play, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { ApiConfig } from '../../../../types';
import { Button } from '../../../../../shared/components/Button';
import { NetworkService } from '../../../../../core/services/NetworkService';

interface StepApiConnectionProps {
  initialConfig?: ApiConfig;
  onSuccess: (data: any[], config: ApiConfig) => void;
  onCancel: () => void;
}

export const StepApiConnection: React.FC<StepApiConnectionProps> = ({ initialConfig, onSuccess, onCancel }) => {
  const [config, setConfig] = useState<ApiConfig>(initialConfig || {
    endpointUrl: '',
    method: 'GET',
    authType: 'none',
    dataKey: ''
  });
  
  const [headersInput, setHeadersInput] = useState(JSON.stringify(initialConfig?.headers || {}, null, 2));
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
        let headers: Record<string, string> = {};
        try { headers = JSON.parse(headersInput); } catch (e) { throw new Error("تنسيق Headers غير صحيح."); }

        const dataArray = await NetworkService.fetch(config, headers);
        setTestResult({ success: true, message: "تم الاتصال وجلب البيانات بنجاح!", count: dataArray.length });
        onSuccess(dataArray, { ...config, headers: headers });
    } catch (e: any) {
        setTestResult({ success: false, message: e.message });
    } finally { setIsTesting(false); }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-border-subtle shadow-sm space-y-6 bg-surface-card animate-fade-in">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-txt-main flex items-center gap-2">
          <Globe size={20} className="text-purple-400" />
          إعدادات الاتصال الذكي (API)
        </h3>
        <button onClick={onCancel} className="text-txt-muted hover:text-red-400 text-sm transition-colors">إلغاء</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <div>
              <label className="block text-xs font-bold text-txt-secondary mb-1.5">رابط الـ API مع المتغيرات</label>
              <div className="flex gap-2">
                  <select 
                    value={config.method}
                    onChange={(e) => setConfig({...config, method: e.target.value as 'GET' | 'POST'})}
                    className="w-24 p-2 text-sm font-bold border border-border-subtle rounded-xl bg-surface-input text-txt-main outline-none focus:border-purple-500 cursor-pointer"
                  >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                  </select>
                  <input 
                    type="url" 
                    value={config.endpointUrl}
                    onChange={(e) => setConfig({...config, endpointUrl: e.target.value})}
                    placeholder="https://api.erp.com/data?since={{last_sync_date}}"
                    className="flex-1 input-fantasy text-sm font-mono placeholder-txt-muted"
                    dir="ltr"
                  />
              </div>
              <div className="mt-3 flex items-start gap-2 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-300 leading-relaxed">
                      نظام المزامنة الإضافية: استخدم <strong>{`{{last_sync_date}}`}</strong> في الرابط ليقوم النظام تلقائياً بتمرير تاريخ آخر عملية مزامنة ناجحة، مما يضمن جلب البيانات الجديدة فقط.
                  </p>
              </div>
          </div>

          <div>
              <label className="block text-xs font-bold text-txt-secondary mb-1.5">مسار البيانات (Data Key Path)</label>
              <div className="relative">
                  <Code size={16} className="absolute top-2.5 right-3 text-txt-muted" />
                  <input 
                    type="text" 
                    value={config.dataKey || ''}
                    onChange={(e) => setConfig({...config, dataKey: e.target.value})}
                    placeholder="e.g. data.items"
                    className="input-fantasy w-full pr-9 pl-3 py-2 text-sm font-mono placeholder-txt-muted"
                    dir="ltr"
                  />
              </div>
          </div>

          <div className="p-4 bg-surface-input rounded-2xl border border-border-subtle">
              <h4 className="text-xs font-bold text-txt-secondary uppercase mb-3 flex items-center gap-1">
                  <Lock size={12} /> المصادقة (Auth)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] font-bold text-txt-muted mb-1">النوع</label>
                      <select 
                        value={config.authType}
                        onChange={(e) => setConfig({...config,authType: e.target.value as any})}
                        className="input-fantasy w-full p-2 text-sm cursor-pointer"
                      >
                          <option value="none">بدون (None)</option>
                          <option value="bearer">Bearer Token</option>
                          <option value="basic">Basic Auth</option>
                          <option value="header">Custom Header</option>
                      </select>
                  </div>
                  {config.authType !== 'none' && (
                      <div>
                          <label className="block text-[10px] font-bold text-txt-muted mb-1">المفتاح / التوكن</label>
                          <input 
                            type="password" 
                            value={config.authToken || ''}
                            onChange={(e) => setConfig({...config, authToken: e.target.value})}
                            className="input-fantasy w-full p-2 text-sm"
                            placeholder="Secret Key..."
                          />
                      </div>
                  )}
              </div>
          </div>
      </div>

      {testResult && (
          <div className={`p-4 rounded-xl flex items-start gap-3 animate-fade-in ${testResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {testResult.success ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
              <div>
                  <p className="font-bold text-sm">{testResult.success ? 'نجح الاتصال' : 'فشل الاتصال'}</p>
                  <p className="text-xs mt-1 opacity-90">{testResult.message}</p>
                  {testResult.success && <p className="text-xs mt-1 font-mono">تم العثور على {testResult.count} سجل.</p>}
              </div>
          </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border-subtle">
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting || !config.endpointUrl}
            icon={isTesting ? <Loader2 className="animate-spin" /> : <Play size={16} />}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
          >
              {isTesting ? 'جاري الاتصال...' : 'اختبار الاتصال ومعاينة البيانات'}
          </Button>
      </div>
    </div>
  );
};
