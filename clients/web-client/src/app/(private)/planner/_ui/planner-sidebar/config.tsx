import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { RoutePaths, routes } from '@/shared/routes';
import { Badge, Typography } from '@/shared/ui-kit';

interface PlannerPath {
  readonly path: RoutePaths;
  readonly icon: ReactNode;
  readonly title: ReactNode;
}

const plannerPaths: PlannerPath[] = [
  {
    title: (
      <>
        <span>INBOX</span>{' '}
        <Badge variant="secondary">
          <Typography.Muted className="text-xs">12</Typography.Muted>
        </Badge>
      </>
    ),
    icon: <Inbox className="size-10" />,
    path: routes.plannerInBox.path,
  },
];

export { plannerPaths };
