'use client';

import { Folder, Inbox } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { RoutePaths, routes } from '@/shared/routes';
import { Badge, DataLoader, Typography, useSidebar } from '@/shared/ui-kit';
import { useSidebarInfoQuery } from '@/widget/planner/planner-sidebar';

interface PlannerSidebarNavPath {
  readonly path: RoutePaths;
  readonly icon: ReactNode;
  readonly title: ReactNode;
}

function useNavItems(): PlannerSidebarNavPath[] {
  const { open } = useSidebar();
  const { data, loading } = useSidebarInfoQuery();
  const inboxTaskCount = data.inbox.taskCount;

  return useMemo(
    () => [
      {
        title: (
          <>
            <span>INBOX</span>{' '}
            <Badge>
              <DataLoader isLoading={loading} loadingElement={<DataLoader.Loading inverse />}>
                <Typography.Muted className="text-white text-xs">{inboxTaskCount ?? 0}</Typography.Muted>
              </DataLoader>
            </Badge>
          </>
        ),
        icon: (
          <div className="relative">
            <Inbox />
            {!open && (inboxTaskCount ?? 0) > 0 && (
              <div className="absolute size-1.5 bg-destructive rounded-4xl top-3 -right-[3px]" />
            )}
          </div>
        ),
        path: routes.plannerInBox.path,
      },

      {
        title: <span>Группы</span>,
        icon: <Folder />,
        path: routes.plannerGroupList.path,
      },
    ],
    [inboxTaskCount, loading, open],
  );
}

export { useNavItems };
