import { TaskStatus, TaskType } from '@/entity/planner/tasks';
import { TaskStatusIndication } from '@/entity/planner/tasks/ui';
import { TaskActions } from '@/feature/planner/tasks/task-actions';
import { Label } from '@/shared/ui-kit/ui/label';
import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';

interface TaskSidebarActionsProps {
  readonly groupId?: number;
  readonly taskInfo: {
    readonly id: string;
    readonly status: TaskStatus;
    readonly type: TaskType;
  };

  readonly onFinishSuccess?: () => Promise<void> | void;
  readonly onAssignSuccess?: () => Promise<void> | void;
  readonly onRecoverSuccess?: () => Promise<void> | void;
  readonly onDeleteSuccess?: () => Promise<void> | void;
  readonly onCloneSuccess?: () => Promise<void> | void;
  readonly onDeleteCompleteSuccess?: () => Promise<void> | void;
}

function TaskSidebarActions({
  taskInfo,
  groupId,
  onFinishSuccess,
  onAssignSuccess,
  onRecoverSuccess,
  onDeleteSuccess,
  onCloneSuccess,
  onDeleteCompleteSuccess,
}: TaskSidebarActionsProps) {
  const { status, id: taskId, type } = taskInfo;

  return (
    <>
      <SidebarGroup className="grid pl-4 pr-6 grid-cols-2 gap-2">
        <Label>Статус:</Label>
        <TaskStatusIndication className="ml-auto" size="md" status={status} />
      </SidebarGroup>

      <SidebarSeparator className="mx-0" />

      <SidebarGroup className="grid px-4 grid-cols-2 gap-2">
        <Label>Действия:</Label>

        <TaskActions
          taskId={taskId}
          status={status}
          type={type}
          groupId={groupId}
          trigger={{ className: 'ml-auto' }}
          onFinishSuccess={onFinishSuccess}
          onAssignSuccess={onAssignSuccess}
          onRecoverSuccess={onRecoverSuccess}
          onDeleteSuccess={onDeleteSuccess}
          onCloneSuccess={onCloneSuccess}
          onDeleteCompleteSuccess={onDeleteCompleteSuccess}
        />
      </SidebarGroup>

      <SidebarSeparator className="mx-0" />
    </>
  );
}

export { TaskSidebarActions, type TaskSidebarActionsProps };
