import { TaskType } from '@/entity/planner/tasks';
import { taskActionToHumanize } from '@/entity/planner/tasks/lib/maps';
import { AppDropdown } from '@/shared/components/app-dropdown';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { capitalize } from 'lodash-es';
import { EllipsisVertical } from 'lucide-react';
import { isAllowTaskAction } from '../../lib';
import { TaskActionType, TaskStatus } from '../../model';
import { TaskAction } from './task-action';

interface TaskActionsDropdownProps {
  readonly loading: boolean;
  readonly triggerClassName?: string;
  readonly taskStatus: TaskStatus;
  readonly taskType: TaskType;
  readonly onAssign?: () => void;
  readonly onFinish?: () => void;
  readonly onRecover?: () => void;
  readonly onDelete?: () => void;
  readonly onDeleteComplete?: () => void;
  readonly onClone?: () => void;
}

function TaskActionsDropdown({
  taskStatus,
  taskType,
  triggerClassName,
  loading,

  onFinish,
  onDelete,
  onRecover,
  onClone,
  onAssign,
  onDeleteComplete,
}: TaskActionsDropdownProps) {
  const actions = [
    {
      element: (
        <TaskAction action={TaskActionType.RECOVER} loading={loading} key="recover" onClick={onRecover}>
          {capitalize(taskActionToHumanize[TaskActionType.RECOVER])}
        </TaskAction>
      ),
      allow: isAllowTaskAction('RECOVER', taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.FINISH} loading={loading} key="finish" onClick={onFinish}>
          {capitalize(taskActionToHumanize[TaskActionType.FINISH])}
        </TaskAction>
      ),
      allow: isAllowTaskAction('FINISH', taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.CLONE} loading={loading} key="clone" onClick={onClone}>
          {capitalize(taskActionToHumanize[TaskActionType.CLONE])}
        </TaskAction>
      ),
      allow: isAllowTaskAction('CLONE', taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.ASSIGN} loading={loading} key="assign" onClick={onAssign}>
          {capitalize(taskActionToHumanize[TaskActionType.ASSIGN])}
        </TaskAction>
      ),
      allow: isAllowTaskAction('ASSIGN', taskStatus, taskType),
    },

    {
      element: (
        <TaskAction
          variant="destructive"
          action={TaskActionType.DELETE_COMPLETE}
          loading={loading}
          key="delete-complete"
          onClick={onDeleteComplete}
        >
          {capitalize(taskActionToHumanize[TaskActionType.DELETE_COMPLETE])}
        </TaskAction>
      ),
      allow: isAllowTaskAction('DELETE_COMPLETE', taskStatus, taskType),
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
          {capitalize(taskActionToHumanize[TaskActionType.DELETE])}
        </TaskAction>
      ),
      allow: isAllowTaskAction('DELETE', taskStatus, taskType),
    },
  ].filter((i) => i.allow);

  const isEmpty = actions.length === 0;

  if (isEmpty) return null;
  return (
    <AppDropdown
      trigger={
        <Button
          variant="ghost"
          className={cn(
            'border-none focus-visible:outline-none focus-visible:border-none focus-visible:ring-0 size-7',
            triggerClassName,
          )}
        >
          <EllipsisVertical />
        </Button>
      }
    >
      {actions.map((action) => action.element)}
    </AppDropdown>
  );
}

export { TaskActionsDropdown };
