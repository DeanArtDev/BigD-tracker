import { AssignInboxTaskToGroupDialog } from '@/entity/planner/groups/ui';
import {
  TaskStatus,
  useAssignTaskToGroup,
  useAssignTaskToInbox,
  useTaskClone,
  useTaskFinish,
} from '@/entity/planner/tasks';
import { isAllowTaskAction } from '@/entity/planner/tasks/lib';
import { ButtonLoading } from '@/shared/components/button-loading';
import { Button } from '@/shared/ui-kit/ui/button';

interface SidebarActionsProps {
  readonly groupId?: number;
  readonly taskInfo: {
    readonly id: number;
    readonly status: TaskStatus;
  };

  readonly onCloneSuccess?: () => Promise<void> | void;
  readonly onFinishSuccess?: () => Promise<void> | void;
}

function SidebarActions({
  taskInfo,
  groupId,
  onCloneSuccess,
  onFinishSuccess,
}: SidebarActionsProps) {
  const { status, id: taskId } = taskInfo;

  const { finishTask, isPending: isTaskFinishPending } = useTaskFinish();
  const { cloneTask, isPending: isTaskCloningPending } = useTaskClone();
  const { assignTaskToGroup, isPending: isAssignTaskToGroupPending } = useAssignTaskToGroup();
  const { assignTaskToInbox, isPending: isAssignTaskToInboxPending } = useAssignTaskToInbox();

  const loading =
    isAssignTaskToGroupPending ||
    isAssignTaskToInboxPending ||
    !isAllowTaskAction('ASSIGN', status);

  return (
    <div className="sidebar-actions grid grid-cols-2 gap-2">
      <ButtonLoading
        className="flex-1"
        disabled={!isAllowTaskAction('FINISH', status)}
        isLoading={isTaskFinishPending}
        size="xs"
        variant="outline"
        type="button"
        onClick={() => {
          finishTask({ params: { path: { taskId } } }, { onSuccess: onFinishSuccess });
        }}
      >
        Завершить
      </ButtonLoading>

      <ButtonLoading
        className="flex-1"
        size="xs"
        variant="outline"
        type="button"
        disabled={!isAllowTaskAction('CLONE', status)}
        isLoading={isTaskCloningPending}
        onClick={() => {
          cloneTask(
            { params: { path: { taskId } }, body: { data: { groupId } } },
            { onSuccess: onCloneSuccess },
          );
        }}
      >
        Клонировать
      </ButtonLoading>

      <AssignInboxTaskToGroupDialog
        taskGroupId={groupId}
        trigger={
          <Button size="xs" variant="outline" type="button" disabled={loading}>
            Переместить
          </Button>
        }
        loading={loading}
        onSelect={(groupInfo, close) => {
          assignTaskToGroup(
            { params: { path: { taskId, groupId: groupInfo.id } } },
            {
              onSuccess: async () => {
                await onFinishSuccess?.();
                close();
              },
            },
          );
        }}
        onInboxSelect={(_, close) => {
          assignTaskToInbox(
            { params: { path: { taskId } } },
            {
              onSuccess: async () => {
                await onFinishSuccess?.();
                close();
              },
            },
          );
        }}
      />
    </div>
  );
}

export { SidebarActions, type SidebarActionsProps };
