import { cn } from '@/shared/ui-kit/utils';
import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

function H6({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return (
    <h6
      className={cn('text-sm font-normal tracking-tight wrap-break-word min-w-0', className)}
      {...props}
    />
  );
}

export { H6 };
