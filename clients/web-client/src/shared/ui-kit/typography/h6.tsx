import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

function H6({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return <h6 className={cn('text-sm font-normal tracking-tight wrap-break-word min-w-0', className)} {...props} />;
}

export { H6 };
