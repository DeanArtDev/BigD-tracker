import { type TaskEntity, useTasksQuery } from '@/entity/planner/tasks';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { useDebounceValue } from 'usehooks-ts';
import { TasksPageManipulator } from './components/tasks-page-manipulator';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { useState } from 'react';
import { TaskList } from './components/task-list';
import { useTaskPageUrlQuery } from './lib/use-task-page-url-query';
import { useTasksPageActions } from './model/use-tasks-page-actions';

function TasksPage() {
  const { pageQuery } = useTaskPageUrlQuery();
  const { tasks, isLoading: isTaskQueryLoading } = useTasksQuery(
    useDebounceValue(pageQuery, 400)[0],
  );

  const [task, setTask] = useState<TaskEntity>();

  const { isLoading, handleFinish, handleDelete, confirmHolder } = useTasksPageActions();

  return (
    <PageWrapper fixContainer className="relative" title="Список дел">
      <TaskList
        tasks={tasks}
        loading={isLoading}
        initialLoading={isTaskQueryLoading}
        onFinish={({ id }) => void handleFinish(id)}
        onDelete={({ id }) => void handleDelete(id)}
        onClick={setTask}
      />

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
