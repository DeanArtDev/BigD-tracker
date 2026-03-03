import { cn } from '@/shared/ui-kit/utils';
import {
  Archive,
  CircleCheckBig,
  CircleX,
  ClockFading,
  Hourglass,
  type LucideProps,
  TimerOff,
  Trash,
} from 'lucide-react';
import type { JSX } from 'react';
import { TaskStatus } from '../../model';

const taskStatusToIconMap: Record<TaskStatus, (props: LucideProps) => JSX.Element> = {
  COMPLETED: (props) => <CircleCheckBig {...props} className={cn('stroke-green-600 stroke-3', props.className)} />,
  OVERDUE: (props) => <TimerOff {...props} className={cn('stroke-red-500', props.className)} />,
  CANCELLED: (props) => <CircleX {...props} className={cn('stroke-red-500', props.className)} />,
  IN_PROGRESS: (props) => <ClockFading {...props} className={cn('stroke-gray-400', props.className)} />,
  NOT_STARTED: (props) => <Hourglass {...props} className={cn('stroke-gray-400', props.className)} />,
  ARCHIVED: (props) => <Archive {...props} className={cn(props.className)} />,
  DELETED: (props) => <Trash {...props} className={cn('stroke-red-500', props.className)} />,
};

export { taskStatusToIconMap };
