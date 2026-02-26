import { type TaskEntity, useTasksArchivedQuery } from '@/entity/planner/tasks';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { InfinityScroll } from '@/shared/components/infinity-scroll';
import { useState } from 'react';
import { TaskList } from './task-list';

function ArchivedTasks() {
  const {
    taskList,
    fetchNextPage,
    hasNextPage,
    isLoading: isTaskLoading,
    isFetchingNextPage,
  } = useTasksArchivedQuery({ perPage: 20 });

  const [task, setTask] = useState<TaskEntity>();

  return (
    <>
      <InfinityScroll
        className="px-2 pb-2 lg:pb-4"
        hasNextPage={hasNextPage}
        isLoadingNextPage={isFetchingNextPage}
        onNextPageLoad={fetchNextPage}
      >
        <TaskList tasks={taskList} initialLoading={isTaskLoading} onClick={setTask} />
      </InfinityScroll>

      <TaskEdit
        taskGroupId={task?.groupId}
        task={task}
        onCansel={() => void setTask(undefined)}
        onSuccess={() => void setTask(undefined)}
      />
    </>
  );
}

export { ArchivedTasks };
