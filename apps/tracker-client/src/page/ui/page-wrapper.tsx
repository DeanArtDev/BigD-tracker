import type { PropsWithChildren } from 'react';
import { cn } from '@/shared/ui-kit/utils';

function PageWrapper(props: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('flex flex-col p-1 lg:p-4', props.className)}>
      {props.children}
    </div>
  );
}

export { PageWrapper };
