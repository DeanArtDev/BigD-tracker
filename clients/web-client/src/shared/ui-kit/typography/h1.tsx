import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

function H1({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>>) {
  return (
    <h1
      className={cn(
        'scroll-m-10 text-center text-4xl font-extrabold tracking-tight text-balance wrap-break-word',
        className,
      )}
      {...props}
    />
  );
}

export { H1 };
