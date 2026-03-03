import { cn } from '@/shared/ui-kit/utils';
import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

function H2({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return (
    <h2 className={cn('pb-2 text-xl md:text-3xl font-semibold tracking-tight wrap-break-word', className)} {...props} />
  );
}

export { H2 };
