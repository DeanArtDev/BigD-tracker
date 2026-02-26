import { TaskStatus } from '@/entity/planner/tasks';
import { TaskStatusIndication } from '@/entity/planner/tasks/ui';
import { TaskActions } from '@/feature/planner/tasks/task-actions';
import { Label } from '@/shared/ui-kit/ui/label';
import { SidebarGroup, SidebarSeparator } from '@/shared/ui-kit/ui/sidebar';

interface SidebarActionsProps {
  readonly groupId?: number;
  readonly taskInfo: {
    readonly id: number;
    readonly status: TaskStatus;
  };

  readonly onFinishSuccess?: () => Promise<void> | void;
  readonly onAssignSuccess?: () => Promise<void> | void;
  readonly onRecoverSuccess?: () => Promise<void> | void;
  readonly onDeleteSuccess?: () => Promise<void> | void;
  readonly onCloneSuccess?: () => Promise<void> | void;
  readonly onDeleteCompleteSuccess?: () => Promise<void> | void;
}

function SidebarActions({
  taskInfo,
  groupId,
  onFinishSuccess,
  onAssignSuccess,
  onRecoverSuccess,
  onDeleteSuccess,
  onCloneSuccess,
  onDeleteCompleteSuccess,
}: SidebarActionsProps) {
  const { status, id: taskId } = taskInfo;

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
          status={status}
          taskId={taskId}
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

export { SidebarActions, type SidebarActionsProps };
