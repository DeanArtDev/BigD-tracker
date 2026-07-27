'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { TaskList, TaskListProps } from './task-list';
import { TasksOrderUpdateReactor } from './tasks-order-update-reactor';
import { DetailedGroupTask } from '../../../_api';

interface GroupTaskListSchemaFormData {
  readonly tasks: DetailedGroupTask[];
}

interface GroupTaskListFormProps extends TaskListProps {
  readonly tasks: GroupTaskListSchemaFormData['tasks'][0][];
  readonly onTasksOrderUpdate: (tasksIds: { id: GroupTaskListSchemaFormData['tasks'][0]['id'] }[]) => void;
}

function GroupTaskListForm({ tasks, loadingTaskId, onTasksOrderUpdate, ...otherProps }: GroupTaskListFormProps) {
  const form = useForm<GroupTaskListSchemaFormData>({
    values: { tasks },
    defaultValues: { tasks },
  });

  return (
    <FormProvider {...form}>
      <form>
        <TaskList loadingTaskId={loadingTaskId} {...otherProps} />
        <TasksOrderUpdateReactor onTasksOrderUpdate={onTasksOrderUpdate} />
      </form>
    </FormProvider>
  );
}

export { GroupTaskListForm, type GroupTaskListFormProps, type GroupTaskListSchemaFormData };
