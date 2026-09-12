import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[J MART Web ErrorBoundary caught]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen dc-ground flex items-center justify-center p-4 font-sans text-[var(--ink)]">
          <div className="max-w-md w-full bg-[var(--panel)] rounded-xl p-6 sm:p-8 border border-[var(--border)] text-center space-y-4">
            <div className="w-12 h-12 bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger-line)] rounded-xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block mb-1">
                System Interface Notice
              </span>
              <h2 className="text-lg font-bold text-[var(--ink)]">
                Display Rendering Error
              </h2>
              <p className="text-xs text-[var(--ink3)] mt-1.5 leading-relaxed">
                We encountered an unexpected display issue. Live till inventory data and your active reservation state remain safely protected.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full h-[46px] inline-flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] font-bold px-5 rounded-lg text-sm transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload J MART Catalog</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
