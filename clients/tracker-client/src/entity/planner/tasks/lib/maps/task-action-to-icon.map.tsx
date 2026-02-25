import { cn } from '@/shared/ui-kit/utils';
import { CircleCheckBig, type LucideProps, Trash, Undo2 } from 'lucide-react';
import { type JSX } from 'react';
import { TaskActionType } from '../../model';

const taskActionToIconMap: Record<TaskActionType, (props: LucideProps) => JSX.Element> = {
  FINISH: (props) => (
    <CircleCheckBig {...props} className={cn('stroke-green-600 stroke-3', props.className)} />
  ),
  DELETE: (props) => <Trash {...props} className={cn('stroke-red-600', props.className)} />,
  ASSIGN: () => <></>,
  CLONE: () => <></>,
  UNASSIGN: () => <></>,
  RECOVER: (props) => <Undo2 {...props} className={cn(props.className)} />,
};

export { taskActionToIconMap };
