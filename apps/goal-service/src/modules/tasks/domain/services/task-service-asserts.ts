import { DateVo } from '@big-d/api-utils';
import { Task, TaskIdBuilder } from '../aggregates/task';
import { ExceptionTaskDomainInvalidInvariant } from '../exceptions';

const taskServiceAsserts = {
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

  ensureRecurrenceIdMatched(input: { taskId: number; currentRecurrenceId?: number; nextRecurrenceId?: number }): void {
    if (input.currentRecurrenceId == null && input.nextRecurrenceId == null) return;

    if (input.currentRecurrenceId !== input.nextRecurrenceId) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId: input.taskId,
        message: `Разные серии повторений ${input.currentRecurrenceId} и ${input.nextRecurrenceId}`,
        field: 'id',
      });
    }
  },

  ensureRepeatableSourceTask(sourceTask: Task): void {
    if (sourceTask.startDate == null || sourceTask.deadline == null || sourceTask.recurrenceId == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId: sourceTask.id,
        message: 'Повторяемое должно иметь startDate и deadline',
        field: 'id',
      });
    }
  },

  ensureRecurrenceStartMatched(input: { taskId: number; date: string; expectedDate: string }): void {
    if (!DateVo.create(input.date).equals(DateVo.create(input.expectedDate))) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId: input.taskId,
        message: 'Не корректная дата в id дела',
        field: 'id',
      });
    }
  },

  ensureRecurrenceAndTaskMatched(input: { taskId: number; expectedTaskId: number }): void {
    if (input.taskId !== input.expectedTaskId) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId: input.taskId,
        message: 'Дело принадлежит другой серии',
        field: 'id',
      });
    }
  },
};

export { taskServiceAsserts };
