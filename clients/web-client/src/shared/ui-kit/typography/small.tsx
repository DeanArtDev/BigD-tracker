import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

function Small({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLDivElement>>) {
  return <small className={cn('text-sm leading-none font-medium', className)} {...props} />;
}

export { Small };
