import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { RoutePaths, routes } from '@/shared/routes';
import { Badge, Typography } from '@/shared/ui-kit';

interface PlannerSidebarNavPath {
  readonly path: RoutePaths;
  readonly icon: ReactNode;
  readonly title: ReactNode;
}

const plannerSidebarNavPaths: PlannerSidebarNavPath[] = [
  {
    title: (
      <>
        <span>INBOX</span>{' '}
        <Badge variant="secondary">
          <Typography.Muted className="text-xs">12</Typography.Muted>
        </Badge>
      </>
    ),
    icon: <Inbox />,
    path: routes.plannerInBox.path,
  },
];

export { plannerSidebarNavPaths, type PlannerSidebarNavPath };
