'use client';

import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { DataLoader } from '@/shared/ui-kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withLazy<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  loaderElement: ReactNode = <DataLoader.Loading size={50} />,
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
