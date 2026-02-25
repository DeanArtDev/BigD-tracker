import { cn } from '@/shared/ui-kit/utils';
import { CircleCheckBig, CircleX, ClockFading, type LucideProps, TimerOff } from 'lucide-react';
import type { JSX } from 'react';
import { TaskStatus } from '../../model';

const taskStatusToIconMap: Record<TaskStatus, (props: LucideProps) => JSX.Element> = {
  COMPLETED: (props) => (
    <CircleCheckBig {...props} className={cn('stroke-green-600 stroke-3', props.className)} />
  ),
  OVERDUE: (props) => <TimerOff {...props} className={cn('stroke-red-500', props.className)} />,
  CANCELLED: (props) => <CircleX {...props} className={cn('stroke-red-500', props.className)} />,
  IN_PROGRESS: (props) => (
    <ClockFading {...props} className={cn('stroke-gray-400', props.className)} />
  ),
  NOT_STARTED: () => <></>,
  ARCHIVED: () => <></>,
  DELETED: () => <></>,
};

export { taskStatusToIconMap };
