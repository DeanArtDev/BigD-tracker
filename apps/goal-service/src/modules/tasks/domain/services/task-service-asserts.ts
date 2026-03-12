import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { Task, TaskIdBuilder, TaskRecurrence } from '../aggregates/task';

const taskServiceAsserts = {
  ensureNotRepeatable(input: { type: 'virtual' | 'override'; recurrence?: unknown; taskId?: string | number }): void {
    if (input.recurrence == null) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `${input.type} task cannot have recurrence`,
      field: 'recurrence',
      taskId: typeof input.taskId === 'number' ? input.taskId : undefined,
    });
  },

  ensureVirtualId(taskId: string): { recurrenceId: number; date: string } {
    const idData = TaskIdBuilder.unwrapId(taskId);

    if (idData?.virtual == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId,
        message: 'Дело не является виртуальным',
        field: 'id',
      });
    }

    return idData.virtual;
  },

  ensureOverrideId(taskId: string): { recurrenceId: number; overrideId: number; date: string } {
    const idData = TaskIdBuilder.unwrapId(taskId);

    if (idData?.override == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId,
        message: 'Дело не является оверрайдом',
        field: 'id',
      });
    }

    return idData.override;
  },

  ensureRecurrenceIdMatchesTaskId(input: {
    taskId: string;
    expectedRecurrenceId: number;
    actualRecurrenceId: number;
    message: string;
  }): void {
    if (input.actualRecurrenceId === input.expectedRecurrenceId) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      taskId: input.taskId,
      message: input.message,
      field: 'id',
    });
  },

  ensureSourceTaskBelongsToRecurrence(input: {
    taskId: string;
    sourceTask: Task;
    currentRecurrence: TaskRecurrence;
  }): void {
    if (input.sourceTask.id === input.currentRecurrence.taskId) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      taskId: input.taskId,
      message: 'Дело принадлежит другой серии',
      field: 'id',
    });
  },

  ensureRepeatableSourceTask(input: { taskId: string; sourceTask: Task }): void {
    if (input.sourceTask.startDate != null && input.sourceTask.deadline != null) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      taskId: input.taskId,
      message: 'Повторяемое должно иметь startDate и deadline',
      field: 'id',
    });
  },

  ensureOverrideDateMatchesTaskId(input: { taskId: string; overrideDate: string; expectedDate: string }): void {
    if (input.overrideDate === input.expectedDate) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      taskId: input.taskId,
      message: 'Не корректная дата в id дела',
      field: 'id',
    });
  },

  ensureDatesAreExistent(input: { taskId: number | string; startDate?: string; deadline?: string }): void {
    if (input.startDate == null || input.deadline == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId: input.taskId,
        message: 'Дело должно иметь startDate и deadline',
        field: 'startDate/deadline',
      });
    }
  },
};

export { taskServiceAsserts };
