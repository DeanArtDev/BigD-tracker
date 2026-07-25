'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { TaskList, TaskListProps } from './task-list';
import { TasksUpdateReactor } from './tasks-update-reactor';
import { DetailedGroupTask } from '../../../_api';

interface GroupTaskListSchemaFormData {
  readonly tasks: DetailedGroupTask[];
}

interface GroupTaskListFormProps extends TaskListProps {
  readonly tasks: GroupTaskListSchemaFormData['tasks'][0][];
  readonly onTasksUpdate: (tasksIds: { id: GroupTaskListSchemaFormData['tasks'][0]['id'] }[]) => void;
}

function GroupTaskListForm({
  tasks,
  loadingTaskId,
  onContentClick,
  onHeaderClick,
  onUnassign,
  onTasksUpdate,
}: GroupTaskListFormProps) {
  const form = useForm<GroupTaskListSchemaFormData>({
    values: { tasks },
    defaultValues: { tasks },
  });

  return (
    <FormProvider {...form}>
      <form>
        <TaskList
          loadingTaskId={loadingTaskId}
          onHeaderClick={onHeaderClick}
          onContentClick={onContentClick}
          onUnassign={onUnassign}
        />
        <TasksUpdateReactor onTasksUpdate={onTasksUpdate} />
      </form>
    </FormProvider>
  );
}

export { GroupTaskListForm, type GroupTaskListFormProps, type GroupTaskListSchemaFormData };
