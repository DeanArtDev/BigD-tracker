import { SidebarInset, SidebarTrigger } from '@/shared/ui-kit/ui/sidebar';
import { Separator } from '@/shared/ui-kit/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/shared/ui-kit/ui/breadcrumb';
import type { PropsWithChildren } from 'react';
import { routes } from '@/shared/lib/routes';
import { type NavMenuItem, navMenuItems } from '@/feature/sidebar';
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

/*TODO
 *  добавить соответствующий путь сейчас моки
 * */
function AppHeader({ children }: PropsWithChildren) {
  const location = useLocation();
  const item = findBreadcrumb(location.pathname);

  return (
    <SidebarInset>
      <header
        className="
        flex h-16 shrink-0 items-center gap-2
        transition-[width,height] ease-linear
        group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            {item != null && (
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink className="text-lg">{item.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            )}
          </Breadcrumb>
        </div>
      </header>

      {children}
    </SidebarInset>
  );
}

export { AppHeader };
