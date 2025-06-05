import { SidebarInset } from '@/shared/ui-kit/ui/sidebar';
import type { PropsWithChildren } from 'react';

function AppMain({ children }: PropsWithChildren) {
  return <SidebarInset className="gorw overflow-auto @container/main">{children}</SidebarInset>;
}

export { AppMain };
