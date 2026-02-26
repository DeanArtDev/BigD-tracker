import { type TaskEntity, useTasksQuery } from '@/entity/planner/tasks';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { InfinityScroll } from '@/shared/components/infinity-scroll';
import { useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { useTaskPageUrlQuery } from '../lib/use-task-page-url-query';
import { TaskList } from './task-list';
import { TasksPageManipulator } from './tasks-page-manipulator';

function CommonTasks() {
  const { pageQuery } = useTaskPageUrlQuery();
  const {
    taskList,
    fetchNextPage,
    hasNextPage,
    isLoading: isTaskLoading,
    isFetchingNextPage,
  } = useTasksQuery({
    perPage: 20,
    ...useDebounceValue(pageQuery, 400)[0],
  });

  const [task, setTask] = useState<TaskEntity>();

  return (
    <div className="flex flex-col grow min-h-0 relative">
      <InfinityScroll
        className="px-2 pb-2 lg:pb-4"
        hasNextPage={hasNextPage}
        isLoadingNextPage={isFetchingNextPage}
        onNextPageLoad={fetchNextPage}
      >
        <TaskList tasks={taskList} initialLoading={isTaskLoading} onClick={setTask} />
      </InfinityScroll>

      <TasksPageManipulator />

      <TaskEdit
        taskGroupId={task?.groupId}
        task={task}
        onCansel={() => void setTask(undefined)}
        onSuccess={() => void setTask(undefined)}
      />
    </div>
  );
}

export { CommonTasks };
