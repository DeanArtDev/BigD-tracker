import { cn } from '@/shared/ui-kit/utils';
import type { PropsWithChildren } from 'react';

function ContentWrapper({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('content-wrapper flex flex-col w-full h-dvh p-0.5 md:p-2 pt-(--mobile-top-space)', className)}>
      <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm pb-(--mobile-bottom-space) overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export { ContentWrapper };
