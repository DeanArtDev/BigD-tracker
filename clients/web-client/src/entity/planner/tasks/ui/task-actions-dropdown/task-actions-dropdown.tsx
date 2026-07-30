import { capitalize } from 'lodash-es';
import { EllipsisVertical } from 'lucide-react';
import { MaybePromise } from '@/shared/lib';
import { AppDropdown } from '@/shared/project-ui';
import { TaskStatus } from '@/shared/transport/graphql';
import { cn, DropdownMenuSeparator } from '@/shared/ui-kit';
import { Button } from '@/shared/ui-kit/ui/button';
import { TaskAction } from './task-action';
import { taskActionToHumanize } from '../../lib/maps';
import { TaskActionType, TaskDomain, TaskType } from '../../model';

interface TaskActionsDropdownProps {
  readonly loading: boolean;
  readonly triggerClassName?: string;
  readonly hasGroup?: boolean;
  readonly taskStatus: TaskStatus;
  readonly taskType: TaskType;
  readonly onAssign?: () => MaybePromise<void>;
  readonly onUnassign?: () => MaybePromise<void>;
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
  hasGroup,

  onFinish,
  onDelete,
  onRecover,
  onClone,
  onAssign,
  onUnassign,
  onDeleteComplete,
}: TaskActionsDropdownProps) {
  const actions = [
    {
      element: (
        <TaskAction action={TaskActionType.Recover} key="recover" onClick={onRecover}>
          {capitalize(taskActionToHumanize[TaskActionType.Recover])}
        </TaskAction>
      ),
      allow: onRecover != null && TaskDomain.isAllowTaskAction(TaskActionType.Recover, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.Finish} key="finish" onClick={onFinish}>
          {capitalize(taskActionToHumanize[TaskActionType.Finish])}
        </TaskAction>
      ),
      allow: onFinish != null && TaskDomain.isAllowTaskAction(TaskActionType.Finish, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.Clone} key="clone" onClick={onClone}>
          {capitalize(taskActionToHumanize[TaskActionType.Clone])}
        </TaskAction>
      ),
      allow: onClone != null && TaskDomain.isAllowTaskAction(TaskActionType.Clone, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction action={TaskActionType.Unassign} key="unassign" onClick={onUnassign}>
          {capitalize(taskActionToHumanize[TaskActionType.Unassign])}
        </TaskAction>
      ),
      allow:
        onUnassign != null && TaskDomain.isAllowTaskAction(TaskActionType.Unassign, taskStatus, taskType) && hasGroup,
    },

    {
      element: (
        <TaskAction action={TaskActionType.Assign} key="assign" onClick={onAssign}>
          {capitalize(taskActionToHumanize[TaskActionType.Assign])}
        </TaskAction>
      ),
      allow: onAssign != null && TaskDomain.isAllowTaskAction(TaskActionType.Assign, taskStatus, taskType),
    },

    { element: <DropdownMenuSeparator key="separator-1" />, allow: onDelete != null || onDeleteComplete != null },

    {
      element: (
        <TaskAction
          variant="destructive"
          action={TaskActionType.DeleteComplete}
          key="delete-complete"
          onClick={onDeleteComplete}
        >
          {capitalize(taskActionToHumanize[TaskActionType.DeleteComplete])}
        </TaskAction>
      ),
      allow:
        onDeleteComplete != null && TaskDomain.isAllowTaskAction(TaskActionType.DeleteComplete, taskStatus, taskType),
    },

    {
      element: (
        <TaskAction variant="destructive" action={TaskActionType.Delete} key="delete" onClick={onDelete}>
          {capitalize(taskActionToHumanize[TaskActionType.Delete])}
        </TaskAction>
      ),
      allow: onDelete != null && TaskDomain.isAllowTaskAction(TaskActionType.Delete, taskStatus, taskType),
    },
  ];

  const isEmpty = actions.length === 0;
  if (isEmpty) return null;
  return (
    <AppDropdown
      align="end"
      trigger={
        <Button
          disabled={loading}
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
      {actions.map((action) => (action.allow ? action.element : null))}
    </AppDropdown>
  );
}

export { TaskActionsDropdown, type TaskActionsDropdownProps };
