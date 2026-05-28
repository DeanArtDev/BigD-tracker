import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

function H5({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return <h4 className={cn('text-base font-semibold tracking-tight wrap-break-word min-w-0', className)} {...props} />;
}

export { H5 };
