import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorDisplay from './ErrorDisplay';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          title="앱 오류가 발생했습니다"
          message={this.state.error?.message || '예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.'}
          onRetry={this.handleReset}
          fullScreen={true}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

