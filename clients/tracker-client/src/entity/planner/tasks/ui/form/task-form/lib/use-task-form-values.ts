import { type TaskEntity, TaskPriority } from '@/entity/planner/tasks';

interface UseTaskFormValuesProps {
  readonly task?: TaskEntity;
  readonly defaultValue?: {
    readonly startDate?: Date;
    readonly deadline?: Date;
  };
}

function useTaskFormValues({ task, defaultValue }: UseTaskFormValuesProps) {
  const isEdit = task != null;

  const defaultValues = isEdit
    ? undefined
    : {
        name: undefined,
        description: undefined,
        weight: 100,
        priority: TaskPriority.DELETE.toString(),
        isDescriptionDirty: false,
        startDate: defaultValue?.startDate,
        deadline: defaultValue?.deadline,
      };

  const { startDate, deadline } = task?.recurrence ?? {};
  const values = isEdit
    ? {
        name: task.name,
        startDate: startDate != null ? new Date(startDate) : undefined,
        deadline: deadline != null ? new Date(deadline) : undefined,
        description: task.description,
        priority: task.priority?.toString(),
        isDescriptionDirty: false,
        weight: task.weight,
      }
    : undefined;

  return {
    values,
    defaultValues,
  };
}

export { useTaskFormValues, type UseTaskFormValuesProps };
