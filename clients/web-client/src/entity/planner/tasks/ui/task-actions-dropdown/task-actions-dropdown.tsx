import { capitalize } from 'lodash-es';
import { EllipsisVertical } from 'lucide-react';
import { TaskStatus } from '@/entity/schema-types';
import { MaybePromise } from '@/shared/lib';
import { AppDropdown } from '@/shared/project-ui';
import { cn } from '@/shared/ui-kit';
import { Button } from '@/shared/ui-kit/ui/button';
import { TaskAction } from './task-action';
import { taskActionToHumanize } from '../../lib/maps';
import { TaskActionType, TaskDomain, TaskType } from '../../model';

interface TaskActionsDropdownProps {
  readonly loading: boolean;
  readonly triggerClassName?: string;
  readonly taskStatus: TaskStatus;
  readonly taskType: TaskType;
  readonly onAssign?: () => MaybePromise<void>;
  readonly onFinish?: () => MaybePromise<void>;
  readonly onRecover?: () => MaybePromise<void>;
  readonly onDelete?: () => MaybePromise<void>;
  readonly onDeleteComplete?: () => MaybePromise<void>;
  readonly onClone?: () => MaybePromise<void>;
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
        <TaskAction action={TaskActionType.Recover} loading={loading} key="recover" onClick={onRecover}>
          {capitalize(taskActionToHumanize[TaskActionType.Recover])}
        </TaskAction>
      ),
      allow: TaskDomain.isAllowTaskAction(TaskActionType.Recover, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.Finish} loading={loading} key="finish" onClick={onFinish}>
          {capitalize(taskActionToHumanize[TaskActionType.Finish])}
        </TaskAction>
      ),
      allow: TaskDomain.isAllowTaskAction(TaskActionType.Finish, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.Clone} loading={loading} key="clone" onClick={onClone}>
          {capitalize(taskActionToHumanize[TaskActionType.Clone])}
        </TaskAction>
      ),
      allow: TaskDomain.isAllowTaskAction(TaskActionType.Clone, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.Assign} loading={loading} key="assign" onClick={onAssign}>
          {capitalize(taskActionToHumanize[TaskActionType.Assign])}
        </TaskAction>
      ),
      allow: TaskDomain.isAllowTaskAction(TaskActionType.Assign, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction
          variant="destructive"
          action={TaskActionType.DeleteComplete}
          loading={loading}
          key="delete-complete"
          onClick={onDeleteComplete}
        >
          {capitalize(taskActionToHumanize[TaskActionType.DeleteComplete])}
        </TaskAction>
      ),
      allow: TaskDomain.isAllowTaskAction(TaskActionType.DeleteComplete, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction
          variant="destructive"
          action={TaskActionType.Delete}
          loading={loading}
          key="delete"
          onClick={onDelete}
        >
          {capitalize(taskActionToHumanize[TaskActionType.Delete])}
        </TaskAction>
      ),
      allow: TaskDomain.isAllowTaskAction(TaskActionType.Delete, taskStatus, taskType),
    },
  ].filter((i) => i.allow);

  const isEmpty = actions.length === 0;
  if (isEmpty) return null;
  return (
    <AppDropdown
      align="end"
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

export { TaskActionsDropdown, type TaskActionsDropdownProps };
