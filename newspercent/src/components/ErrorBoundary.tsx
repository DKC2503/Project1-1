import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
          <div className="max-w-2xl w-full liquid-glass p-10 rounded-[2.5rem] border-red-500/20 bg-red-500/5 text-center">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
            
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
              Critical System Failure
            </h1>
            
            <div className="bg-black/50 rounded-2xl p-6 text-left mb-8 border border-white/5 overflow-auto max-h-[300px]">
              <p className="text-red-500 font-bold text-xs uppercase mb-2 tracking-widest">Error Log:</p>
              <p className="text-white text-sm mb-4">{this.state.error?.toString()}</p>
              
              {this.state.errorInfo && (
                <>
                  <p className="text-cyan-500 font-bold text-xs uppercase mb-2 tracking-widest">Stack Trace:</p>
                  <pre className="text-[10px] text-[var(--text-secondary)] whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-red-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reboot Interface
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
              >
                <Home className="w-4 h-4" /> Return to Core
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
