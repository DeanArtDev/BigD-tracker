import Link from 'next/link';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/ui-kit';
import { PlannerSidebarNavPath } from './planner-sidebar-nav-paths';

interface PlannerSidebarMenuItemProps extends PlannerSidebarNavPath {
  readonly active: boolean;
}

function PlannerSidebarMenuItem({ icon, path, title, active }: PlannerSidebarMenuItemProps) {
  return (
    <SidebarMenuItem className="flex justify-center items-center">
      <SidebarMenuButton asChild isActive={active} tooltip={{ children: title }}>
        <Link href={path}>
          {icon}

          {title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export { PlannerSidebarMenuItem, type PlannerSidebarMenuItemProps };
