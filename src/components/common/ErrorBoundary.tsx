import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackSectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] Component failure in ${this.props.fallbackSectionName || 'section'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="py-12 my-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl glass-panel border border-borderGlass/60 text-center font-mono text-xs text-gray-400">
            <span className="text-rose-400 font-bold block mb-1">
              {this.props.fallbackSectionName || 'Section'} Unavailable
            </span>
            <span>Unable to render content section cleanly. Admin settings will restore when published.</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
