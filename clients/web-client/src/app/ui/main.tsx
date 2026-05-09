import { PropsWithChildren } from 'react';
import { cn } from '@/shared/ui-kit/lib/utils';

interface MainProps {
  readonly className?: string;
}

function Main({ children, className }: PropsWithChildren<MainProps>) {
  return <main className={cn('min-h-dvh min-w-dvw', className)}>{children}</main>;
}

export { Main, type MainProps };
