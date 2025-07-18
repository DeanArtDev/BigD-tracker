import { ToggleGroupForm } from '@/shared/components/form';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/shared/ui-kit/ui/sidebar';
import { ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { cn } from '@/shared/ui-kit/utils';
import { Circle } from 'lucide-react';
import { DateBlock } from './date-block';

function SidebarRight() {
  const { state } = useSidebar();

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="offcanvas"
      className={cn('sticky h-full border-l border-t', {
        'w-0': isCollapsed,
      })}
    >
      <SidebarRail type="button" />

      <SidebarContent>
        <SidebarGroup key="dates" className="flex gap-2">
          <DateBlock />
        </SidebarGroup>

        <SidebarSeparator className="mx-0" />

        <SidebarGroup key="priority" className="px-4">
          <ToggleGroupForm name="priority" label="Приоритет">
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

export { SidebarRight };
