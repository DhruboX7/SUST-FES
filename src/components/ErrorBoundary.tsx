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
      ? 'py-10 px-4 flex items-center justify-center text-[#19382B] dark:text-[#F3F1E8]'
      : 'min-h-screen flex items-center justify-center p-6 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]';

    return (
      <div className={wrapperClass}>
        <div className="max-w-md w-full bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 rounded-lg p-6 sm:p-8 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/40 text-[#987453] dark:text-[#BBC4A6] mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
              Something went wrong displaying this view
            </h1>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
              The portal caught an unexpected error to prevent the browser tab from crashing. Your bookmarks and settings remain safe.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-[#987453] dark:text-[#BBC4A6] bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 rounded-md px-3 py-2 break-words">
                {this.state.errorMessage}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 flex-wrap">
            <button
              type="button"
              onClick={this.handleRetry}
              className="w-full sm:w-auto px-4 py-2 rounded-md text-xs font-semibold bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#F3F1E8] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="w-full sm:w-auto px-4 py-2 rounded-md text-xs font-semibold bg-[#EAE7DA] hover:bg-[#BBC4A6]/40 dark:bg-[#142D22] dark:hover:bg-[#42684D]/40 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[#19382B] dark:text-[#F3F1E8] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </button>

            {!this.props.compact && (
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2 rounded-md text-xs font-semibold bg-[#EAE7DA] hover:bg-[#BBC4A6]/40 dark:bg-[#142D22] dark:hover:bg-[#42684D]/40 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[#19382B] dark:text-[#F3F1E8] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
            <button
              type="button"
              onClick={this.handleClearCacheAndReload}
              className="text-[11px] font-medium text-[#8A9C74] hover:text-[#987453] dark:text-[#BBC4A6] dark:hover:text-[#F3F1E8] inline-flex items-center gap-1 transition-colors cursor-pointer"
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
