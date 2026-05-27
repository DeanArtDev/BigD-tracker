'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly fallback: (error: Error, reset: () => void) => ReactNode;
  readonly onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}
