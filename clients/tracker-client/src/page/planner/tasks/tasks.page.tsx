import { type TaskEntity, useTasksQuery } from '@/entity/planner/tasks';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { InfinityScroll } from '@/shared/components/infinity-scroll';
import { useDebounceValue } from 'usehooks-ts';
import { TasksPageManipulator } from './components/tasks-page-manipulator';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { useState } from 'react';
import { TaskList } from './components/task-list';
import { useTaskPageUrlQuery } from './lib/use-task-page-url-query';
import { useTasksPageActions } from './model/use-tasks-page-actions';

function TasksPage() {
  const { pageQuery } = useTaskPageUrlQuery();
  const { taskList, fetchNextPage, hasNextPage, isFetchingNextPage } = useTasksQuery({
    perPage: 10,
    ...useDebounceValue(pageQuery, 400)[0],
  });

  const [task, setTask] = useState<TaskEntity>();

  const { isLoading, handleFinish, handleDelete, confirmHolder } = useTasksPageActions();

  return (
    <PageWrapper fixContainer className="relative" title="Список дел">
      <InfinityScroll
        className="px-2 py-2 lg:py-4"
        hasNextPage={hasNextPage}
        isLoadingNextPage={isFetchingNextPage}
        onNextPageLoad={fetchNextPage}
      >
        <TaskList
          tasks={taskList}
          loading={isLoading}
          initialLoading={isFetchingNextPage}
          onFinish={({ id }) => void handleFinish(id)}
          onDelete={({ id }) => void handleDelete(id)}
          onClick={setTask}
        />
      </InfinityScroll>

      <TasksPageManipulator />

      {confirmHolder}

      <TaskEdit
        taskGroupId={task?.groupId}
        task={task}
        onCansel={() => void setTask(undefined)}
        onSuccess={() => void setTask(undefined)}
      />
    </PageWrapper>
  );
}

export const Component = TasksPage;
