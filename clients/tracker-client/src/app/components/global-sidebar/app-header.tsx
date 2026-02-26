import { type NavMenuItem, navMenuItems } from '@/feature/sidebar';
import { gymRoutesMap } from '@/page/gym';
import type { PageApplicationRoutMap } from '@/page/lib/types';
import { plannerRoutesMap } from '@/page/planner/lib/constants';
import { type RoutePaths } from '@/shared/lib/routes';
import type { ValueOf } from '@/shared/lib/type-helpers';
import { useIsMobile } from '@/shared/ui-kit/helpers/use-mobile';
import { AppBreadcrumb, type AppBreadcrumbProps } from '@/shared/ui-kit/ui/app-breadcrumb';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { SidebarTrigger, useSidebarStore } from '@/shared/ui-kit/ui/sidebar';
import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const findPage = (pathname: string): ValueOf<PageApplicationRoutMap> | null => {
  const maps = { ...gymRoutesMap, ...plannerRoutesMap };
  for (const [key, value] of Object.entries(maps)) {
    const match = matchPath(key, pathname);
    if (match != null) {
      return {
        ...value,
        to: match?.pathname ?? value.to,
      };
    }
  }
  return null;
};

const findApplicationNavItem = (target: RoutePaths | string): NavMenuItem | null => {
  for (const item of navMenuItems) {
    if (typeof item.to === 'string' && item.to.includes(target)) return item;
    if (typeof item.to !== 'string' && item.to.pathname?.includes(target)) return item;
  }
  return null;
};

function AppHeader() {
  const location = useLocation();
  const { toggleSidebarState } = useSidebarStore();
  const isMobile = useIsMobile();

  const breadcrumbs = useMemo<AppBreadcrumbProps['items']>(() => {
    const [, application] = location.pathname.split('/');
    const applicationNavItem = findApplicationNavItem(application);
    if (applicationNavItem == null) return [];

    const buffer: AppBreadcrumbProps['items'] = [
      { to: applicationNavItem.to, children: applicationNavItem.title },
    ];

    const page = findPage(location.pathname);
    if (page != null) {
      buffer.push({ title: 'separator' });
      buffer.push({ to: page.to, children: page.title });
    }

    return buffer;
  }, [location.pathname]);

  return (
    <header className="bg-background group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger
          className="-ml-1"
          onClick={() => void (isMobile ? undefined : toggleSidebarState())}
        />

        <Separator orientation="vertical" className="mx-2" />

        <h1 className="text-base font-medium">
          <AppBreadcrumb items={breadcrumbs} />
        </h1>
      </div>
    </header>
  );
}

export { AppHeader };
