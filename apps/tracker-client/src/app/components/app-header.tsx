import { type NavMenuItem, navMenuItems } from '@/feature/sidebar';
import { routes } from '@/shared/lib/routes';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { SidebarTrigger } from '@/shared/ui-kit/ui/sidebar';
import { useLocation } from 'react-router-dom';

type RoutePaths = (typeof routes)[keyof typeof routes]['path'];

const findBreadcrumb = (target: RoutePaths | string): NavMenuItem | null => {
  let buffer: NavMenuItem[] = [];

  for (const item of navMenuItems) {
    if (item.items != null && item.items.length > 0) {
      buffer = buffer.concat(item.items);
    }
  }

  for (const b of buffer) {
    if (b.to === target) return b;
  }

  return null;
};

function AppHeader() {
  const location = useLocation();
  const item = findBreadcrumb(location.pathname);

  return (
    <header className="bg-background group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">{item?.title}</h1>
      </div>
    </header>
  );
}

export { AppHeader };
