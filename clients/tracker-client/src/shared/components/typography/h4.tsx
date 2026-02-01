import { cn } from '@/shared/ui-kit/utils';
import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

function H4({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return (
    <h4
      className={cn('text-xl font-semibold tracking-tight wrap-break-word', className)}
      {...props}
    />
  );
}

export { H4 };
