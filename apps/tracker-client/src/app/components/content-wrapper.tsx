import { cn } from '@/shared/ui-kit/utils';
import type { PropsWithChildren } from 'react';

function ContentWrapper({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('flex flex-col grow h-dvh p-[2px] md:p-[10px]', className)}>
      <div className="flex flex-col bg-background rounded-lg grow border overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

export { ContentWrapper };
