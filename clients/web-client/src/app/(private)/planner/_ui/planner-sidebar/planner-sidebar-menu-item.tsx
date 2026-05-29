import Link from 'next/link';
import { ReactNode } from 'react';
import { RoutePaths } from '@/shared/routes';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/ui-kit';

interface PlannerSidebarMenuItemProps {
  readonly href: RoutePaths;
  readonly icon: ReactNode;
  readonly title: ReactNode;
  readonly active: boolean;
}

function PlannerSidebarMenuItem({ icon, href, title, active }: PlannerSidebarMenuItemProps) {
  return (
    <SidebarMenuItem className="flex justify-center items-center">
      <SidebarMenuButton asChild isActive={active} tooltip={{ children: title }}>
        <Link href={href}>
          {icon}

          {title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export { PlannerSidebarMenuItem, type PlannerSidebarMenuItemProps };
