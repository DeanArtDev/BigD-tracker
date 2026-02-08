import { TaskStatus } from '@/entity/planner/tasks';
import { cn } from '@/shared/ui-kit/utils';
import { Check, CircleX, type LucideProps } from 'lucide-react';
import type { JSX } from 'react';

const TaskStatusToIconMap: Record<TaskStatus, (props: Omit<LucideProps, 'ref'>) => JSX.Element> = {
  COMPLETED: (props) => (
    <Check {...props} className={cn(props.className, 'stroke-green-600 stroke-5')} />
  ),
  OVERDUE: (props) => <CircleX {...props} className={cn(props.className, 'stroke-red-500')} />,
  NOT_STARTED: () => <></>,
  IN_PROGRESS: () => <></>,
  ARCHIVED: () => <></>,
  CANCELLED: () => <></>,
  DELETED: () => <></>,
};

export { TaskStatusToIconMap };
