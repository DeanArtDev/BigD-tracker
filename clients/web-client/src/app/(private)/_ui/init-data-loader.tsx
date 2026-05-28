import { PropsWithChildren, Suspense } from 'react';
import { Spinner } from '@/shared/ui-kit';

function InitDataLoader({ children }: PropsWithChildren) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh min-w-dvw flex items-center justify-center">
          <Spinner className="size-20 stroke-primary" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export { InitDataLoader };
