import { Component, type PropsWithChildren } from 'react';

class GlobalErrorBoundary extends Component<PropsWithChildren> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>Что-то пошло не так: {String(this.state.error)}</div>;
    }

    return this.props.children;
  }
}

export { GlobalErrorBoundary };
