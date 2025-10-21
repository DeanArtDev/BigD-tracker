import type { PageApplicationRote } from '@/page/lib/types';
import { routes } from '@/shared/lib/routes';
import { Inbox, ListOrdered, type LucideProps } from 'lucide-react';

const plannerRoutesMap: Record<string, PageApplicationRote> = {
  [routes.plannerInBox.path]: {
    to: routes.plannerInBox.path,
    title: 'In Box',
    icon: (props: LucideProps) => <Inbox {...props} />,
  },

  [routes.plannerGroupList.path]: {
    to: routes.plannerGroupList.path,
    title: 'Группы',
    icon: (props: LucideProps) => <ListOrdered {...props} />,
  },
};

export { plannerRoutesMap };
