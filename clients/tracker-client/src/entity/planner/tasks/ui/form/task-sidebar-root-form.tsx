import { Button } from '@/shared/ui-kit/ui/button';
import { Sidebar, SidebarContent, useSidebar } from '@/shared/ui-kit/ui/sidebar';
import { cn } from '@/shared/ui-kit/utils';
import { PanelLeftIcon } from 'lucide-react';
import * as React from 'react';
import { type PropsWithChildren } from 'react';

type TaskSidebarRootFormProps = PropsWithChildren;

function TaskSidebarRootForm({ children }: TaskSidebarRootFormProps) {
  const { isMobile, state } = useSidebar();

  const isCollapsed = state === 'collapsed';
  const style = isMobile
    ? undefined
    : ({
        '--sidebar-width': '270px',
      } as React.CSSProperties);

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="offcanvas"
      style={style}
      className={cn('sticky h-full min-h-0 border-t border-b rounded-bl-md rounded-tl-md overflow-hidden', {
        'w-0': isCollapsed,
      })}
    >
      <SidebarContent>{children}</SidebarContent>
    </Sidebar>
  );
}

function TaskFormSidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      className={cn('size-7', className)}
      type="button"
      size="icon"
      variant="ghost"
      tabIndex={-1}
      onClick={toggleSidebar}
    >
      <PanelLeftIcon className="size-5" />
    </Button>
  );
}

export { TaskSidebarRootForm, TaskFormSidebarTrigger };
