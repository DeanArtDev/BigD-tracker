import { cn } from '@/shared/ui-kit/utils';
import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

function H3({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return (
    <h3
      className={cn('text-2xl font-semibold tracking-tight wrap-break-word', className)}
      {...props}
    />
  );
}

export { H3 };
