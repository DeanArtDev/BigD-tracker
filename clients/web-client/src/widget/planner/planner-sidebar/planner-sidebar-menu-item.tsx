'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/ui-kit';
import { PlannerSidebarNavPath } from './planner-sidebar-nav-paths';

interface PlannerSidebarMenuItemProps extends PlannerSidebarNavPath {
  readonly active: boolean;
}

function PlannerSidebarMenuItem({ icon, path, title, active }: PlannerSidebarMenuItemProps) {
  const pathname = usePathname();

  return (
    <SidebarMenuItem className="flex justify-center items-center">
      <SidebarMenuButton asChild isActive={active} tooltip={{ children: title }}>
        <Link
          href={path}
          onNavigate={(evt) => {
            if (path === pathname) {
              evt.preventDefault();
            }
          }}
        >
          {icon}

          {title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export { PlannerSidebarMenuItem, type PlannerSidebarMenuItemProps };
