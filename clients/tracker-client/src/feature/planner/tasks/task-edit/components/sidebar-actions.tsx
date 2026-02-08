import { TaskStatus, useTaskClone, useTaskFinish } from '@/entity/planner/tasks';
import { isAllowTaskAction } from '@/entity/planner/tasks/lib';
import { ButtonLoading } from '@/shared/components/button-loading';

interface SidebarActionsProps {
  readonly taskInfo: {
    readonly id: number;
    readonly status: TaskStatus;
    readonly groupId?: number;
  };

  readonly onCloneSuccess?: () => Promise<void> | void;
  readonly onFinishSuccess?: () => Promise<void> | void;
}

function SidebarActions({ taskInfo, onCloneSuccess, onFinishSuccess }: SidebarActionsProps) {
  const { status, groupId, id: taskId } = taskInfo;

  const { finishTask, isPending: isTaskFinishPending } = useTaskFinish();
  const { cloneTask, isPending: isTaskCloningPending } = useTaskClone();

  return (
    <div className="sidebar-actions flex flex-row gap-2">
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
    </div>
  );
}

export { SidebarActions, type SidebarActionsProps };
