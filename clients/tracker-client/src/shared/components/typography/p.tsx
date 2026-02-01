import { cn } from '@/shared/ui-kit/utils';
import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

function P({
  className,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLParagraphElement>>) {
  return <p className={cn('leading-7 wrap-break-word', className)} {...props} />;
}

export { P };
