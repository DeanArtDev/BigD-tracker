import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { AssignInboxTaskToGroupDialog } from '@/entity/planner/groups/ui';
import {
  type TaskEntity,
  useDeleteCompleteTask,
  useInvalidateAllTasks,
  useTasksDeletedQuery,
} from '@/entity/planner/tasks';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { InfinityScroll } from '@/shared/components/infinity-scroll';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { useState } from 'react';
import { TaskList } from './task-list';

function DeletedTasks() {
  const {
    taskList,
    fetchNextPage,
    hasNextPage,
    isLoading: isTaskLoading,
    isFetchingNextPage,
  } = useTasksDeletedQuery({
    perPage: 20,
  });

  const [task, setTask] = useState<TaskEntity>();
  const [taskInfo, setTaskInfo] = useState<{ id: number; groupId?: number } | null>(null);

  const { deleteCompleteTask, isPending: isTaskDeleteCompletePending } = useDeleteCompleteTask();

  const invalidateAllGroups = useInvalidateAllGroups();
  const invalidateDiaryTasks = useInvalidateAllTasks();
  const invalidate = async () => {
    await invalidateDiaryTasks();
    await invalidateAllGroups();
  };

  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const handleDelete = (taskId: number) => {
    viaConfirmation({
      isNeedConfirm: () => true,
      callback: () =>
        void deleteCompleteTask({ params: { path: { taskId } } }, { onSuccess: invalidate }),
      dialog: {
        title: 'Удалить полностью?',
        content: 'Это окончательное удаление, больше дело восстановить будет нельзя!',
      },
    });
  };

  return (
    <>
      <InfinityScroll
        className="px-2 pb-2 lg:pb-4"
        hasNextPage={hasNextPage}
        isLoadingNextPage={isFetchingNextPage}
        onNextPageLoad={fetchNextPage}
      >
        <TaskList
          tasks={taskList}
          loading={isTaskDeleteCompletePending}
          initialLoading={isTaskLoading}
          onDelete={({ id }) => void handleDelete(id)}
          onRecover={({ id, groupId }) => void setTaskInfo({ id, groupId })}
          onClick={setTask}
        />
      </InfinityScroll>

      <AssignInboxTaskToGroupDialog
        open={taskInfo != null}
        onOpenChange={(value) => {
          if (!value) setTaskInfo(null);
        }}
        onSelect={(groupInfo, close) => {
          console.log(groupInfo);
          close();
        }}
        onInboxSelect={(groupInfo, close) => {
          console.log(groupInfo);
          close();
        }}
      />

      <TaskEdit
        taskGroupId={task?.groupId}
        task={task}
        onCansel={() => void setTask(undefined)}
        onSuccess={() => void setTask(undefined)}
      />

      {confirmHolder}
    </>
  );
}

export { DeletedTasks };
