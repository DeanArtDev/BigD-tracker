import { cn } from '@/shared/ui-kit/utils';
import type { PropsWithChildren } from 'react';

function ContentWrapper({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'flex flex-col w-full h-dvh p-[2px] md:p-[10px] pt-(--mobile-top-space)',
        className,
      )}
    >
      <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm pb-(--mobile-bottom-space)">
        {children}
      </div>
    </div>
  );
}

export { ContentWrapper };
