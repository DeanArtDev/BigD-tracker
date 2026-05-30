import { Dumbbell, Notebook } from 'lucide-react';
import { ReactNode } from 'react';
import { RoutePaths, routes } from '@/shared/routes';
import { Badge } from '@/shared/ui-kit';

interface ApplicationNavPath {
  readonly path: RoutePaths;
  readonly icon: ReactNode;
  readonly title: ReactNode;
  readonly disabled?: boolean;
}

const applicationNavPaths: ApplicationNavPath[] = [
  {
    title: 'Планировщик',
    icon: <Notebook />,
    path: routes.planner.path,
  },

  {
    title: (
      <>
        Тренировки{' '}
        <Badge className="text-muted-foreground" variant="secondary">
          Скоро
        </Badge>
      </>
    ),
    icon: <Dumbbell />,
    path: routes.gym.path,
    disabled: true,
  },
];

export { applicationNavPaths };
