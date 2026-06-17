'use client';

import { Inbox } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { RoutePaths, routes } from '@/shared/routes';
import { Badge, Typography, useSidebar } from '@/shared/ui-kit';

interface PlannerSidebarNavPath {
  readonly path: RoutePaths;
  readonly icon: ReactNode;
  readonly title: ReactNode;
}

interface UseNavItemsProps {
  readonly inboxCount?: number;
}

function useNavItems({ inboxCount }: UseNavItemsProps): PlannerSidebarNavPath[] {
  const { open } = useSidebar();

  return useMemo(
    () => [
      {
        title: (
          <>
            <span>INBOX</span> {inboxCount && <CountBadge count={inboxCount ?? 0} />}
          </>
        ),
        icon: (
          <div className="relative">
            <Inbox />
            {!open && (inboxCount ?? 0) > 0 && (
              <div className="absolute size-1.5 bg-red-500 rounded-4xl top-3 -right-[3px]" />
            )}
          </div>
        ),
        path: routes.plannerInBox.path,
      },
    ],
    [inboxCount, open],
  );
}

function CountBadge({ className, count }: { className?: string; count: number }) {
  return (
    <Badge variant="secondary" className={className}>
      <Typography.Muted className="text-xs">{count}</Typography.Muted>
    </Badge>
  );
}

export { useNavItems, type UseNavItemsProps };
