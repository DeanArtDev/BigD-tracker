'use client';

import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { DataLoadingElement } from '@/shared/ui-kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withLazy<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  loaderElement: ReactNode = <DataLoadingElement size={50} />,
) {
  const Component = lazy<T>(loader);

  return function LazyComponent(props: Parameters<typeof Component>[0]) {
    return (
      <Suspense fallback={loaderElement}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export { withLazy };
