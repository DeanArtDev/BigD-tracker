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
        isRecurrence: false,
        recurrence: undefined,
      };

  const values = isEdit
    ? {
        name: task.name,
        startDate: task.startDate != null ? new Date(task.startDate) : undefined,
        deadline: task.deadline != null ? new Date(task.deadline) : undefined,
        description: task.description,
        priority: task.priority?.toString(),
        isDescriptionDirty: false,
        weight: task.weight,
        isRecurrence: task.recurrence != null,
        recurrence: {
          frequency: task.recurrence?.frequency?.toString(),
          weekdays: task.recurrence?.weekdays?.map(String),
          start: task.recurrence?.start != null ? new Date(task.recurrence?.start) : undefined,
          end: task.recurrence?.end != null ? new Date(task.recurrence?.end) : undefined,
        },
      }
    : undefined;

  return {
    values,
    defaultValues,
  };
}

export { useTaskFormValues, type UseTaskFormValuesProps };
