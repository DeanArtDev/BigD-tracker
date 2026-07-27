import { debounce } from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { TaskId } from '@/entity/planner/tasks';
import { GroupTaskListSchemaFormData } from './group-task-list.form';

const SAVE_DELAY_MS = 1000;

interface TasksOrderUpdateReactorProps {
  readonly onTasksOrderUpdate: (tasksIds: { id: TaskId }[]) => void;
}

function TasksOrderUpdateReactor({ onTasksOrderUpdate }: TasksOrderUpdateReactorProps) {
  const { subscribe, reset } = useFormContext<GroupTaskListSchemaFormData>();

  const onTasksUpdateEvent = useEffectEvent(onTasksOrderUpdate);

  useEffect(() => {
    const debouncedUpdate = debounce((value: GroupTaskListSchemaFormData['tasks']) => {
      const tasks = value.map(({ id }) => ({ id }));
      onTasksUpdateEvent(tasks);
      reset({ tasks: value }, { keepDirty: false, keepDirtyValues: false, keepValues: true });
    }, SAVE_DELAY_MS);

    const unsubscribe = subscribe({
      name: ['tasks'],
      formState: { values: true },
      callback: (data) => {
        if (data.isDirty) {
          debouncedUpdate(data.values.tasks);
        }
      },
    });

    return () => {
      unsubscribe();
      debouncedUpdate.cancel();
    };
  }, [reset, subscribe]);

  return null;
}

export { TasksOrderUpdateReactor, type TasksOrderUpdateReactorProps };
