import { routes } from '@/shared/lib/routes';
import { Dumbbell } from 'lucide-react';
import type { NavMenuItem } from '../nav-menu';

const navMenuItems: NavMenuItem[] = [
  {
    title: 'Gym',
    to: routes.gym.path,
    icon: Dumbbell,
    defaultOpen: false,
    items: [
      {
        title: 'Главная',
        to: routes.gymHome.path,
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
];

export { navMenuItems };
