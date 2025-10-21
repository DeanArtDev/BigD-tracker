import { routes } from '@/shared/lib/routes';
import { Dumbbell, Notebook } from 'lucide-react';
import type { NavMenuItem } from '../nav-menu';

const navMenuItems: NavMenuItem[] = [
  {
    title: 'Спорт зал',
    to: routes.gym.path,
    icon: Dumbbell,
    defaultOpen: false,
  },

  {
    title: 'Планировщик',
    to: routes.planner.path,
    icon: Notebook,
    defaultOpen: false,
  },
];

export { navMenuItems };
