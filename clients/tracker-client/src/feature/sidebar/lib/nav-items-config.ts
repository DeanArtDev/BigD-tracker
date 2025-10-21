import { routes } from '@/shared/lib/routes';
import { Dumbbell, Notebook } from 'lucide-react';
import type { NavMenuItem } from '../nav-menu';

const navMenuItems: NavMenuItem[] = [
  {
    title: 'Gym',
    to: routes.gym.path,
    icon: Dumbbell,
    defaultOpen: false,
    items: [
      {
        title: 'Текущая тренировка',
        to: routes.gymActiveTraining.path,
      },
      {
        title: 'Дашборд',
        to: routes.gymDashboard.path,
      },
      {
        title: 'Тренировки',
        to: routes.gymTrainings.path,
      },
      {
        title: 'Упражнения',
        to: routes.gymExercises.path,
      },
      {
        title: 'Программы',
        to: routes.gymPrograms.path,
      },
    ],
  },

  {
    title: 'Planner',
    to: routes.planner.path,
    icon: Notebook,
    defaultOpen: false,
    items: [
      {
        title: 'IN BOX',
        to: routes.plannerInBox.path,
      },
      {
        title: 'Группы',
        to: routes.plannerGroupList.path,
      },
    ],
  },
];

export { navMenuItems };
