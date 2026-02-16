
import React, { useState } from 'react';
import { Coins, Plus, Trash2, Info } from 'lucide-react';
import { useCompany } from '../../../../context/CompanyContext';
import { ExchangeRate, CurrencySettings as CurrencySettingsType } from '../../../../types';
import { SettingsSectionHeader } from './SettingsSectionHeader';

export const CurrencySettings: React.FC = () => {
    const { config, updateConfig } = useCompany();
    const settings = config.currencySettings || {
        baseCurrency: 'SAR',
        currencyDimensionId: '',
        exchangeRates: [],
        autoConversionEnabled: false
    };

    const [newCode, setNewCode] = useState('');
    const [newRate, setNewRate] = useState(1);

    const handleUpdate = (updates: Partial<CurrencySettingsType>) => {
        updateConfig({ currencySettings: { ...settings, ...updates } });
    };

    const handleAddRate = () => {
        if (!newCode.trim()) return;
        const newRateObj: ExchangeRate = {
            code: newCode.trim().toUpperCase(),
            label: newCode.trim().toUpperCase(),
            rate: newRate,
            lastUpdated: new Date().toISOString()
        };
        handleUpdate({ exchangeRates: [...settings.exchangeRates, newRateObj] });
        setNewCode('');
        setNewRate(1);
    };

    const handleDeleteRate = (code: string) => {
        handleUpdate({ exchangeRates: settings.exchangeRates.filter(r => r.code !== code) });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <SettingsSectionHeader 
                title="إدارة تعدد العملات والتحويل (Currency Engine)"
                description="تفعيل التحويل الآلي للمبالغ المالية بناءً على جدول صرف مخصص. يتيح لك النظام دمج بيانات من عملات مختلفة في تقرير موحد."
                icon={Coins}
                bgClass="bg-amber-500/10"
                iconColorClass="text-amber-500"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-border-subtle shadow-sm space-y-6 bg-surface-card">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-txt-main text-sm">إعدادات المحرك</h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={settings.autoConversionEnabled} 
                                    onChange={e => handleUpdate({ autoConversionEnabled: e.target.checked })} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-surface-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-txt-muted uppercase mb-1.5">العملة الموحدة للتقارير (Base)</label>
                                <input 
                                    type="text" 
                                    value={settings.baseCurrency} 
                                    onChange={e => handleUpdate({ baseCurrency: e.target.value.toUpperCase() })}
                                    className="w-full p-3 input-fantasy font-black text-amber-400 outline-none focus:border-amber-500"
                                    placeholder="SAR, USD..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-txt-muted uppercase mb-1.5">البُعد الموفر للعملة (Source)</label>
                                <select 
                                    value={settings.currencyDimensionId} 
                                    onChange={e => handleUpdate({ currencyDimensionId: e.target.value })}
                                    className="w-full p-3 input-fantasy text-xs font-bold outline-none cursor-pointer"
                                >
                                    <option value="">-- اختر البعد --</option>
                                    {config.dimensionsRegistry.filter(d => d.enabled).map(d => (
                                        <option key={d.id} value={d.id}>{d.label}</option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-txt-muted mt-2">أي بُعد يحدد عملة السطر (مثلاً: بُعد "العملة" أو "الحساب").</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-500/10 p-5 rounded-3xl border border-amber-500/20 flex gap-3">
                        <Info size={18} className="text-amber-500 shrink-0" />
                        <p className="text-[10px] text-amber-200 leading-relaxed">
                            <strong>كيف يعمل؟</strong> عند تفعيل المحرك، سيقوم النظام بالبحث عن رمز العملة في البعد المختار، ثم ضرب المبلغ في "سعر الصرف" المعرف في الجدول المقابل، قبل إجراء أي حسابات أخرى.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 glass-card rounded-3xl border border-border-subtle shadow-xl overflow-hidden flex flex-col bg-surface-card">
                    <div className="px-6 py-4 bg-surface-overlay border-b border-border-subtle flex justify-between items-center">
                        <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">جدول أسعار الصرف (Exchange Rates)</span>
                        <div className="flex gap-2">
                             <input 
                                type="text" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                                placeholder="EUR" className="w-16 p-2 text-xs font-black input-fantasy rounded-lg outline-none"
                             />
                             <input 
                                type="number" value={newRate} onChange={e => setNewRate(Number(e.target.value))}
                                className="w-20 p-2 text-xs font-black input-fantasy rounded-lg outline-none"
                             />
                             <button onClick={handleAddRate} className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-500 shadow-sm transition-all"><Plus size={16}/></button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        {settings.exchangeRates.length === 0 ? (
                            <div className="py-20 text-center text-txt-muted italic text-sm">لا توجد عملات معرفة. العملة الأساسية تعامل دائماً بمعامل (1).</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {settings.exchangeRates.map(rate => (
                                    <div key={rate.code} className="flex items-center justify-between p-4 bg-surface-input rounded-2xl border border-border-subtle hover:border-amber-500/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-surface-card rounded-xl flex items-center justify-center font-black text-amber-500 shadow-sm border border-border-subtle">{rate.code}</div>
                                            <div>
                                                <div className="text-[9px] text-txt-muted font-bold">1 {rate.code} =</div>
                                                <div className="text-sm font-black text-txt-main">{rate.rate} <span className="text-[10px] text-txt-muted">{settings.baseCurrency}</span></div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteRate(rate.code)} className="p-2 text-txt-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
