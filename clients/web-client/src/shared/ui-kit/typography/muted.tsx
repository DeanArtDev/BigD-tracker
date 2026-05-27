import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

function Muted({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLParagraphElement>>) {
  return <p className={cn('text-muted-foreground text-sm wrap-break-word', className)} {...props} />;
}

export { Muted };
