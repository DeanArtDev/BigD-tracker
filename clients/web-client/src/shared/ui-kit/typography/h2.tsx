import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

function H2({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return (
    <h2 className={cn('text-xl md:text-3xl font-semibold tracking-tight wrap-break-word', className)} {...props} />
  );
}

export { H2 };
