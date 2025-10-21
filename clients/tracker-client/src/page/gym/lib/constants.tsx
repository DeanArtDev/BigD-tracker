import type { PageApplicationRote } from '@/page/lib/types';
import { routes } from '@/shared/lib/routes';
import { CircleGauge, ListChecks, type LucideProps, Trophy, X } from 'lucide-react';

const gymRoutesMap: Record<string, PageApplicationRote> = {
  [routes.gymActiveTraining.path]: {
    to: routes.gymActiveTraining.path,
    title: 'Текущая тренировка',
    icon: (props: LucideProps) => <CircleGauge {...props} />,
  },
  [routes.gymTrainings.path]: {
    to: routes.gymTrainings.path,
    title: 'Тренировки',
    icon: (props: LucideProps) => <ListChecks {...props} />,
  },
  [routes.gymExercises.path]: {
    to: routes.gymExercises.path,
    title: 'Упражнения',
    icon: (props: LucideProps) => <Trophy {...props} />,
  },
  [routes.gymDashboard.path]: {
    to: routes.gymDashboard.path,
    title: 'Дашборд',
    icon: (props: LucideProps) => <X color="var(--color-destructive)" {...props} />,
  },
  [routes.gymPrograms.path]: {
    to: routes.gymPrograms.path,
    title: 'Программы',

    icon: (props: LucideProps) => <X color="var(--color-destructive)" {...props} />,
  },
};

export { gymRoutesMap };
