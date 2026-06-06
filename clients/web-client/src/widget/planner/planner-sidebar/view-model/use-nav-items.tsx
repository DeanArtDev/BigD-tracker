import { Inbox } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { RoutePaths, routes } from '@/shared/routes';
import { Badge, Typography } from '@/shared/ui-kit';

interface PlannerSidebarNavPath {
  readonly path: RoutePaths;
  readonly icon: ReactNode;
  readonly title: ReactNode;
}

interface UseNavItemsProps {
  readonly inboxCount?: number;
}

function useNavItems({ inboxCount }: UseNavItemsProps): PlannerSidebarNavPath[] {
  return useMemo(
    () => [
      {
        title: (
          <>
            <span>INBOX</span>{' '}
            {inboxCount != null && (
              <Badge variant="secondary">
                <Typography.Muted className="text-xs">{inboxCount}</Typography.Muted>
              </Badge>
            )}
          </>
        ),
        icon: <Inbox />,
        path: routes.plannerInBox.path,
      },
    ],
    [inboxCount],
  );
}

export { useNavItems, type UseNavItemsProps };
