import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { cn, SidebarTrigger, useSidebar } from '@/shared/ui-kit';

function PlannerSidebarTrigger() {
  const { open } = useSidebar();

  return (
    <SidebarTrigger className={cn({ 'ml-auto': open, 'mx-auto': !open })} size="icon" type="button">
      {open ? (
        <PanelLeftClose className="size-5 stroke-muted-foreground" />
      ) : (
        <PanelLeft className="size-5 stroke-muted-foreground" />
      )}
    </SidebarTrigger>
  );
}

export { PlannerSidebarTrigger };
