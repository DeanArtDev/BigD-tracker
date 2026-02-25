import { TaskActionType, TaskStatus } from '@/entity/planner/tasks';
import { isAllowTaskAction } from '@/entity/planner/tasks/lib';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui-kit/ui/dropdown-menu';
import { cn } from '@/shared/ui-kit/utils';
import { EllipsisVertical } from 'lucide-react';
import { TaskAction } from './task-action';

interface TaskActionsProps {
  readonly loading: boolean;
  readonly className?: string;
  readonly taskStatus: TaskStatus;
  readonly onFinish: () => void;
  readonly onRecover: () => void;
  readonly onDelete: () => void;
}

function TaskActions({
  taskStatus,
  className,
  loading,

  onFinish,
  onDelete,
  onRecover,
}: TaskActionsProps) {
  const actions = [
    {
      element: (
        <TaskAction
          action={TaskActionType.RECOVER}
          loading={loading}
          key="recover"
          onClick={onRecover}
        >
          Восстановить
        </TaskAction>
      ),
      allow: isAllowTaskAction('RECOVER', taskStatus),
    },
    {
      element: (
        <TaskAction
          action={TaskActionType.FINISH}
          loading={loading}
          key="finish"
          onClick={onFinish}
        >
          Завершить
        </TaskAction>
      ),
      allow: isAllowTaskAction('FINISH', taskStatus),
    },
    {
      element: (
        <TaskAction
          variant="destructive"
          action={TaskActionType.DELETE}
          loading={loading}
          key="delete"
          onClick={onDelete}
        >
          Удалить
        </TaskAction>
      ),
      allow: isAllowTaskAction('DELETE', taskStatus),
    },
  ].filter((i) => i.allow);

  const isEmpty = actions.length === 0;

  if (isEmpty) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'border-none focus-visible:outline-none focus-visible:border-none focus-visible:ring-0 size-7',
            className,
          )}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-fit">
        {actions.map((action) => action.element)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { TaskActions };
