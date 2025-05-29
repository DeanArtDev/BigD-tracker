import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';

function withLazy<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  loaderElement: ReactNode = <AppLoader />,
) {
  const Component = lazy<T>(loader);

  return (props: Parameters<typeof Component>[0]) => (
    <Suspense fallback={loaderElement}>
      <Component {...props} />
    </Suspense>
  );
}

export { withLazy };
