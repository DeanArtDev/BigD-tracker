'use client';

import { isFunction } from 'lodash-es';
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  readonly children: ReactNode | ((props: { reset: () => void; retryKey: number }) => ReactNode);
  readonly fallback: (params: { error: Error; reset: () => void; retryKey: number }) => ReactNode;
  readonly onError?: (params: { error: Error; info: ErrorInfo; retryKey: number }) => void;
}

interface State {
  readonly error: Error | null;
  retryKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, retryKey: 1 };

  static getDerivedStateFromError(error: Error): State {
    return { error, retryKey: 1 };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.({ error, info, retryKey: this.state.retryKey });
  }

  reset = () => this.setState((prev) => ({ ...prev, error: null, retryKey: prev.retryKey + 1 }));

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset, retryKey: this.state.retryKey });
    }
    return isFunction(this.props.children)
      ? this.props.children({ reset: this.reset, retryKey: this.state.retryKey })
      : this.props.children;
  }
}
