'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { TaskList } from './task-list';
import { TasksUpdateReactor } from './tasks-update-reactor';
import { DetailedGroupTask } from '../../../_api';

interface GroupTaskListSchemaFormData {
  readonly tasks: DetailedGroupTask[];
}

interface GroupTaskListFormProps {
  readonly tasks: GroupTaskListSchemaFormData['tasks'][0][];

  readonly onTasksUpdate: (tasksIds: { id: GroupTaskListSchemaFormData['tasks'][0]['id'] }[]) => void;
  readonly onHeaderClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => void;
  readonly onContentClick: (task: GroupTaskListSchemaFormData['tasks'][0]) => void;
}

function GroupTaskListForm({ tasks, onContentClick, onHeaderClick, onTasksUpdate }: GroupTaskListFormProps) {
  const form = useForm<GroupTaskListSchemaFormData>({
    values: { tasks },
    defaultValues: { tasks },
  });

  return (
    <FormProvider {...form}>
      <form>
        <TaskList onHeaderClick={onHeaderClick} onContentClick={onContentClick} />
        <TasksUpdateReactor onTasksUpdate={onTasksUpdate} />
      </form>
    </FormProvider>
  );
}

export { GroupTaskListForm, type GroupTaskListFormProps, type GroupTaskListSchemaFormData };
