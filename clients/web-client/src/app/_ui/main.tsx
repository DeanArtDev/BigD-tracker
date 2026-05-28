import { PropsWithChildren } from 'react';
import { cn } from '@/shared/ui-kit/lib/utils';

interface MainProps {
  readonly className?: string;
}

function Main({ children, className }: PropsWithChildren<MainProps>) {
  return <main className={cn('grid @container/main box-border', className)}>{children}</main>;
}

export { Main, type MainProps };
