import { ToggleGroupForm } from '@/shared/components/form';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarSeparator,
  useSidebar,
} from '@/shared/ui-kit/ui/sidebar';
import { ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { cn } from '@/shared/ui-kit/utils';
import { Circle } from 'lucide-react';
import { TaskFormInboxDates } from './task-form-inbox-dates';

function TaskFormInboxSidebar() {
  const { state } = useSidebar();

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="offcanvas"
      className={cn(
        'sticky h-full min-h-0 border-t border-b rounded-bl-xl rounded-tl-xl overflow-hidden ml-4 -mr-4',
        { 'w-0': isCollapsed },
      )}
    >
      <SidebarContent>
        <SidebarGroup key="dates" className="flex gap-2">
          <TaskFormInboxDates />
        </SidebarGroup>

        <SidebarSeparator className="separator mx-0" />

        <SidebarGroup key="priority" className="px-4">
          <ToggleGroupForm name="priority" tabIndex={-1} label="Приоритет">
            <ToggleGroupItem
              value="1"
              className="w-[30px] data-[state=on]:bg-[var(--priority-1)]/20"
            >
              <Circle strokeWidth={3} color="var(--priority-1)" />
            </ToggleGroupItem>

            <ToggleGroupItem
              value="2"
              className="w-[30px] data-[state=on]:bg-[var(--priority-2)]/20"
            >
              <Circle strokeWidth={3} color="var(--priority-2)" />
            </ToggleGroupItem>

            <ToggleGroupItem
              value="3"
              className="w-[30px] data-[state=on]:bg-[var(--priority-3)]/20"
            >
              <Circle strokeWidth={3} color="var(--priority-3)" />
            </ToggleGroupItem>

            <ToggleGroupItem
              value="4"
              className="w-[30px] data-[state=on]:bg-[var(--priority-4)]/20"
            >
              <Circle strokeWidth={3} color="var(--priority-4)" />
            </ToggleGroupItem>
          </ToggleGroupForm>
        </SidebarGroup>

        <SidebarSeparator className="mx-0" />
      </SidebarContent>
    </Sidebar>
  );
}

export { TaskFormInboxSidebar };
