import timeAndDate from '@/shared/lib/time';
import { RecurrenceFrequency, type TaskCreateInput } from '@/shared/transport/graphql/schema-types';
import type { Task } from '../../model';
import type { GroupBrand, TaskFormData, TaskSubmitFormData } from './context/task-form-provider/task-form-schema';

function getTaskFormValues<TGroupId extends GroupBrand>(task?: Task<TGroupId>): TaskFormData<TGroupId> | undefined {
  if (task == null) return undefined;

  const baseValues = {
    name: task.name,
    priority: task.priority,
    description: task.description ?? undefined,
    startDate: task.startDate != null ? timeAndDate(task.startDate).toDate() : undefined,
    deadline: task.deadline != null ? timeAndDate(task.deadline).toDate() : undefined,
    groupId: task.groupId ?? undefined,
    status: task.status,
    isDescriptionDirty: false,
  };

  if (task.recurrence == null) {
    return {
      ...baseValues,
      isRecurrence: false,
      isEndless: true,
      untilDate: null,
      frequency: null,
      weekdays: null,
      monthdays: null,
    };
  }

  if (task.startDate == null || task.deadline == null) {
    throw new Error('Recurring task must have startDate and deadline');
  }

  const endlessValues =
    task.recurrence.untilDate == null
      ? {
          isEndless: true as const,
          untilDate: null,
        }
      : {
          isEndless: false as const,
          untilDate: timeAndDate(task.recurrence.untilDate).toDate(),
        };

  const recurrenceValues = {
    ...baseValues,
    startDate: timeAndDate(task.startDate).toDate(),
    deadline: timeAndDate(task.deadline).toDate(),
    isRecurrence: true as const,
    ...endlessValues,
  };

  switch (task.recurrence.frequency) {
    case RecurrenceFrequency.Daily:
      return {
        ...recurrenceValues,
        frequency: RecurrenceFrequency.Daily,
        weekdays: null,
        monthdays: null,
      };

    case RecurrenceFrequency.Weekly:
      return {
        ...recurrenceValues,
        frequency: RecurrenceFrequency.Weekly,
        weekdays: [...(task.recurrence.weekdays ?? [])],
        monthdays: null,
      };

    case RecurrenceFrequency.Monthly:
      return {
        ...recurrenceValues,
        frequency: RecurrenceFrequency.Monthly,
        weekdays: null,
        monthdays: [...(task.recurrence.monthdays ?? [])],
      };

    default:
      return null as never;
  }
}

function getRecurrenceFromTaskFormData<TGroupId extends GroupBrand>(
  formData: TaskSubmitFormData<TGroupId>,
): TaskCreateInput['recurrence'] | null {
  if (!formData.isRecurrence) return null;

  if (typeof formData.startDate !== 'string' || typeof formData.deadline !== 'string') {
    throw new Error('Recurring task must have startDate and deadline');
  }

  const untilDate = formData.isEndless ? undefined : formData.untilDate;

  if (!formData.isEndless && untilDate == null) {
    throw new Error('Finite recurrence must have untilDate');
  }

  const recurrenceBase: Pick<NonNullable<TaskCreateInput['recurrence']>, 'startDate' | 'untilDate'> = {
    startDate: formData.startDate,
    untilDate,
  };

  switch (formData.frequency) {
    case RecurrenceFrequency.Daily:
      return {
        ...recurrenceBase,
        frequency: RecurrenceFrequency.Daily,
      };

    case RecurrenceFrequency.Weekly:
      return {
        ...recurrenceBase,
        frequency: RecurrenceFrequency.Weekly,
        weekdays: formData.weekdays,
      };

    case RecurrenceFrequency.Monthly:
      return {
        ...recurrenceBase,
        frequency: RecurrenceFrequency.Monthly,
        monthdays: formData.monthdays,
      };

    default:
      return null as never;
  }
}

export { getRecurrenceFromTaskFormData, getTaskFormValues };
