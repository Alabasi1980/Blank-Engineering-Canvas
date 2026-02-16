
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Check, Loader2, AlertTriangle } from 'lucide-react';

interface UIContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const [globalLoading, setGlobalLoadingState] = useState<{ visible: boolean; message: string }>({
      visible: false,
      message: 'جاري المعالجة...'
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const setGlobalLoading = useCallback((loading: boolean, message: string = 'جاري العمل...') => {
      setGlobalLoadingState({ visible: loading, message });
  }, []);

  return (
    <UIContext.Provider value={{ showToast, setGlobalLoading }}>
      {children}
      
      {/* Global Toast */}
      {toast.visible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 glass-card bg-surface-sidebar/90 border border-border-subtle text-txt-main px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 animate-fade-in-down backdrop-blur-md">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-500' : 
            toast.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'
          }`}>
            {toast.type === 'success' ? <Check size={14} strokeWidth={3} /> : <AlertTriangle size={14} strokeWidth={3} />}
          </div>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Global Loading Overlay */}
      {globalLoading.visible && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
              <div className="glass-card bg-surface-card p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-6 min-w-[250px] border border-border-subtle relative overflow-hidden">
                  {/* Decor */}
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-pulse"></div>
                  
                  <div className="relative">
                      <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping"></div>
                      <div className="relative bg-surface-input p-4 rounded-full border border-border-subtle shadow-inner">
                          <Loader2 size={32} className="text-primary-400 animate-spin" />
                      </div>
                  </div>
                  <span className="text-sm font-black text-txt-main tracking-wide animate-pulse">{globalLoading.message}</span>
              </div>
          </div>
      )}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
