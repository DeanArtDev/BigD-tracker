import { usePathname } from 'next/navigation';
import { SidebarMenu } from '@/shared/ui-kit';
import { PlannerSidebarMenuItem } from './planner-sidebar-menu-item';
import { useNavItems } from './view-model/use-nav-items';

function PlannerSidebarNavList() {
  const pathname = usePathname();
  const navItems = useNavItems();

  return (
    <SidebarMenu>
      {navItems.map((p) => (
        <PlannerSidebarMenuItem
          key={p.path}
          path={p.path}
          title={p.title}
          icon={p.icon}
          active={pathname.includes(p.path)}
        />
      ))}
    </SidebarMenu>
  );
}

export { PlannerSidebarNavList };
