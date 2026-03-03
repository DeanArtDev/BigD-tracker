import { cn } from '@/shared/ui-kit/utils';
import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

function Code({ className, ...props }: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>>) {
  return (
    <code
      className={cn('bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)}
      {...props}
    />
  );
}

export { Code };
