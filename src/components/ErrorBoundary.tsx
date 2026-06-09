/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, Terminal } from 'lucide-react';
import { logSystemError, getDeveloperErrorLogs, clearDeveloperErrorLogs, SystemErrorLog } from '../logs/error-log';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
  showDevLogs: boolean;
  logsList: SystemErrorLog[];
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      copied: false,
      showDevLogs: false,
      logsList: [],
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      copied: false,
      showDevLogs: false,
      logsList: [],
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Record to persistent developer logs file
    logSystemError(error, errorInfo.componentStack || undefined);
    
    // Maintain a state copy of the logs list
    this.setState({
      logsList: getDeveloperErrorLogs()
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleCopy = () => {
    if (!this.state.error) return;
    const errorDetails = `Error: ${this.state.error.message}\nStack: ${this.state.error.stack || ''}\nURL: ${window.location.href}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  private handleClearLogs = () => {
    clearDeveloperErrorLogs();
    this.setState({ logsList: [] });
  };


  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 antialiased text-right font-sans" 
          dir="rtl"
          id="error-boundary-screen"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 max-w-lg w-full text-center relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-rose-500 to-amber-500" />
            
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 font-sans">
              تنبيه اتصال: حدث اضطراب في مزامنة البيانات
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
              نواجه حالياً صعوبة مؤقتة في ربط تدفق البيانات المباشر مع خوادم Firebase السحابية أو حدوث استثناء مفاجئ في دفق المعاملات. تم تأمين سلامة واجهتك وضمان عدم تلف الجلسة. يمكنك إعادة تشغيل الاتصال أو المتابعة للرئيسية.
            </p>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mb-6 text-[11px] font-mono text-slate-600 text-left overflow-x-auto max-h-32 leading-relaxed relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={this.handleCopy}
                    className="p-1 px-2 bg-white/90 border border-slate-200/80 rounded-md text-[10px] flex items-center gap-1 font-sans text-slate-700 cursor-pointer shadow-sm hover:bg-slate-50"
                  >
                    {this.state.copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{this.state.copied ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="w-full sm:flex-1 bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3.5 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/10 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </button>
            </div>

            {/* Collapsible section for Developers/Inspectors */}
            <div className="border-t border-slate-100 pt-5 text-right">
              <button
                onClick={() => this.setState(prev => ({ showDevLogs: !prev.showDevLogs }))}
                className="mx-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{this.state.showDevLogs ? 'إخفاء سجل المطورين الفني' : 'إظهار لوحة تسجيل أخطاء المطورين'}</span>
                <span className="bg-slate-100 font-mono text-[9px] px-1.5 py-0.5 rounded-full text-slate-600">
                  {this.state.logsList.length}
                </span>
              </button>

              {this.state.showDevLogs && (
                <div className="mt-4 bg-slate-900 rounded-2xl p-4 text-slate-300 text-left font-mono text-[10px] overflow-hidden shadow-inner max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2" dir="rtl">
                    <span className="text-amber-400 font-semibold font-sans text-xs flex items-center gap-1">
                      📁 /src/logs/error-log.ts (تخزين محلي مباشر)
                    </span>
                    <button
                      onClick={this.handleClearLogs}
                      className="bg-white/10 hover:bg-rose-950/40 hover:text-rose-400 text-white/70 py-1 px-2.5 rounded font-sans text-[9px] cursor-pointer transition-all"
                    >
                      مسح السجلات
                    </button>
                  </div>

                  {this.state.logsList.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 font-sans" dir="rtl">
                      لا يوجد أي أخطاء مسجلة حالياً في سجل المطورين.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {this.state.logsList.map((log) => (
                        <div key={log.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1" dir="rtl">
                            <span className="bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-sans uppercase">
                              {log.type}
                            </span>
                            <span>{new Date(log.timestamp).toLocaleString('ar-YE')}</span>
                          </div>
                          <div className="text-amber-200 select-all font-semibold leading-relaxed break-all">
                            {log.message}
                          </div>
                          {log.componentStack && (
                            <div className="text-slate-500 text-[8px] mt-1 whitespace-pre max-h-20 overflow-y-auto leading-normal">
                              {log.componentStack}
                            </div>
                          )}
                          <div className="text-slate-600 text-[8px] mt-1 break-all">
                            URL: {log.url}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
