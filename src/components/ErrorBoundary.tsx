import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    try {
      localStorage.removeItem('credora_template_config');
    } catch {
      // Ignore storage errors
    }
    window.location.href = window.location.pathname;
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100"
        >
          <div className="max-w-md w-full brutal-card p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 space-y-5 text-center">
            
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-600 text-rose-600">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-slate-900 dark:text-white">
                Unexpected Application Error
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Credora encountered an unhandled issue. No certificate data was lost or transmitted externally.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-left font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-900/20 max-h-32 overflow-y-auto">
                <span className="font-bold text-rose-600 dark:text-rose-400 block text-[11px] mb-1">
                  Error Details:
                </span>
                <span className="break-words">{this.state.error.message || 'Unknown error occurred'}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full min-h-[44px] brutal-btn-yellow text-xs font-mono font-black uppercase flex items-center justify-center gap-2 text-black"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full min-h-[44px] rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-900 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Workspace Session</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
