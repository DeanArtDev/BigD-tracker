import type { PageApplicationRote } from '@/page/lib/types';
import { routes } from '@/shared/lib/routes';
import { Inbox, ListOrdered, BookMarked, type LucideProps } from 'lucide-react';

const plannerRoutesMap: Record<string, PageApplicationRote> = {
  [routes.plannerInBox.path]: {
    to: routes.plannerInBox.path,
    title: 'IN BOX',
    internal: false,
    icon: (props: LucideProps) => <Inbox {...props} />,
  },

  [routes.plannerGroupList.path]: {
    to: routes.plannerGroupList.path,
    title: 'Группы',
    internal: false,
    icon: (props: LucideProps) => <ListOrdered {...props} />,
  },

  [routes.plannerGroup.path]: {
    to: routes.plannerGroup.path,
    title: 'Группа',
    internal: true,
  },

  [routes.plannerDiary.path]: {
    to: routes.plannerDiary.path,
    title: 'Ежедневник',
    internal: false,
    icon: (props: LucideProps) => <BookMarked {...props} />,
  },
};

export { plannerRoutesMap };
