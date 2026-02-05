import { useTaskClone, useTaskFinish } from '@/entity/planner/tasks';
import { ButtonLoading } from '@/shared/components/button-loading';

interface SidebarActionsProps {
  readonly taskId?: number;
  readonly groupId: number;
  readonly onCloneSuccess?: () => Promise<void> | void;
  readonly onFinishSuccess?: () => Promise<void> | void;
}

function SidebarActions({ groupId, taskId, onCloneSuccess, onFinishSuccess }: SidebarActionsProps) {
  const { finishTask, isPending: isTaskFinishPending } = useTaskFinish();
  const { cloneTask, isPending: isTaskCloningPending } = useTaskClone();

  return (
    <div className="sidebar-actions flex flex-row gap-2">
      <ButtonLoading
        className="flex-1"
        isLoading={isTaskFinishPending}
        size="xs"
        variant="outline"
        type="button"
        onClick={() => {
          if (taskId != null) {
            finishTask({ params: { path: { taskId } } }, { onSuccess: onFinishSuccess });
          }
        }}
      >
        Завершить
      </ButtonLoading>

      <ButtonLoading
        className="flex-1"
        size="xs"
        variant="outline"
        type="button"
        isLoading={isTaskCloningPending}
        onClick={() => {
          if (taskId != null) {
            cloneTask(
              { params: { path: { taskId } }, body: { data: { groupId } } },
              { onSuccess: onCloneSuccess },
            );
          }
        }}
      >
        Клонировать
      </ButtonLoading>
    </div>
  );
}

export { SidebarActions, type SidebarActionsProps };
