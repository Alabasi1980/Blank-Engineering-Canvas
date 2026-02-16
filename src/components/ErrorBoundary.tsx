
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard React Error Boundary.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface-app">
          <div className="glass-card rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-red-500/30 bg-surface-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_#ef4444]"></div>
            
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-neon border border-red-500/20">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-2xl font-black text-txt-main mb-2">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-txt-secondary mb-6 text-sm leading-relaxed">
              واجه النظام مشكلة أثناء معالجة طلبك. قد يكون السبب مشكلة مؤقتة في البيانات أو الاتصال.
            </p>

            <div className="bg-black/30 p-4 rounded-xl text-left text-[10px] font-mono text-red-400 mb-8 overflow-auto max-h-32 dir-ltr border border-red-500/20 shadow-inner">
                {this.state.error?.message || 'Unknown Error'}
            </div>

            <button 
              onClick={this.handleReload}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20 active:scale-95"
            >
              <RefreshCcw size={18} />
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
