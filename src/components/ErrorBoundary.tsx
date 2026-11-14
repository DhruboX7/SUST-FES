import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
  compact?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false, errorMessage: '' });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    try {
      window.location.hash = '#/';
    } catch {
      // Ignore hash navigation errors
    }
  };

  handleClearCacheAndReload = (): void => {
    try {
      const keysToReset = [
        'sust_fes_resources_obe_v2',
        'sust_fes_species_v2',
        'sust_fes_gallery_v2',
        'sust_fes_theses_v2',
        'sust_fes_notices_v2',
        'sust_fes_routines_v1',
        'sust_fes_quicklinks_v1',
        'sust_fes_student_photos_v1',
      ];
      keysToReset.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore storage access errors
    }
    try {
      window.location.hash = '#/';
    } catch {
      // Ignore hash navigation errors
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const wrapperClass = this.props.compact
      ? 'py-10 px-4 flex items-center justify-center text-stone-900 dark:text-stone-100'
      : 'min-h-screen flex items-center justify-center p-6 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100';

    return (
      <div className={wrapperClass}>
        <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Something went wrong displaying this view
            </h1>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              The portal caught an unexpected error to prevent the browser tab from crashing. Your bookmarks and settings remain safe.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 break-words">
                {this.state.errorMessage}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 flex-wrap">
            <button
              type="button"
              onClick={this.handleRetry}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </button>

            {!this.props.compact && (
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={this.handleClearCacheAndReload}
              className="text-[11px] font-medium text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Cached Collections &amp; Reload</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
