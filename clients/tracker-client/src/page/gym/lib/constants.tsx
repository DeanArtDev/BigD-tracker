import type { PageApplicationRote } from '@/page/lib/types';
import { routes } from '@/shared/lib/routes';
import { CircleGauge, ListChecks, type LucideProps, Trophy, X } from 'lucide-react';

const gymRoutesMap: Record<string, PageApplicationRote> = {
  [routes.gymActiveTraining.path]: {
    to: routes.gymActiveTraining.path,
    title: 'Текущая тренировка',
    internal: false,
    icon: (props: LucideProps) => <CircleGauge {...props} />,
  },
  [routes.gymTrainings.path]: {
    to: routes.gymTrainings.path,
    title: 'Тренировки',
    internal: false,
    icon: (props: LucideProps) => <ListChecks {...props} />,
  },
  [routes.gymExercises.path]: {
    to: routes.gymExercises.path,
    title: 'Упражнения',
    internal: false,
    icon: (props: LucideProps) => <Trophy {...props} />,
  },
  [routes.gymDashboard.path]: {
    to: routes.gymDashboard.path,
    title: 'Дашборд',
    internal: false,
    icon: (props: LucideProps) => <X color="var(--color-destructive)" {...props} />,
  },
  [routes.gymPrograms.path]: {
    to: routes.gymPrograms.path,
    title: 'Программы',
    internal: false,
    icon: (props: LucideProps) => <X color="var(--color-destructive)" {...props} />,
  },
};

export { gymRoutesMap };
