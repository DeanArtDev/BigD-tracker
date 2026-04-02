import { TaskFinishStatus, TaskRecurrenceStatus, TaskStatus } from '@big-d/api-contracts';
import { DateVo, MonthdaysVo, Name, timeAndDate, TimezoneVo, YearmonthsVo } from '@big-d/api-utils';
import { maxBy } from 'lodash';
import { Task, TaskFactory, TaskFactoryReplaceInput, TaskOverride, TaskRecurrence } from '../aggregates/task';
import { Priority, Weight } from '../aggregates/task/value-objects';
import { ExceptionTaskDomainInvalidInvariant } from '../exceptions';

interface TaskWithRecurrenceInput {
  readonly startDate: string;
  readonly pattern: string;
  readonly timezone: string;
  readonly frequency: TaskRecurrence['frequency']['value'];
  readonly weekstart?: TaskRecurrence['weekstart'];
  readonly untilDate?: string;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrence['weekdays'];
  readonly monthdays?: TaskRecurrence['monthdays'];
  readonly yearmonths?: TaskRecurrence['yearmonths'];
}

interface TaskWithRecurrenceCreateInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly recurrence: TaskWithRecurrenceInput;
  readonly currentOverrides: TaskOverride[];
}

interface TaskWithRecurrenceUpdateInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly recurrencePatch: TaskWithRecurrenceInput;
  readonly currentRecurrence?: TaskRecurrence | null;
  readonly currentOverrides: TaskOverride[];
}

interface TaskWithRecurrenceCancelInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly currentRecurrence: TaskRecurrence;
  readonly currentOverrides: TaskOverride[];
  readonly patternShaper: (data: Omit<TaskWithRecurrenceInput, 'pattern'>) => string;
}

interface TaskWithRecurrenceReplaceInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly currentRecurrence: TaskRecurrence | null | undefined;
  readonly currentOverrides?: TaskOverride[];
  readonly recurrencePatch: Omit<TaskWithRecurrenceInput, 'pattern'> | undefined;
  readonly patternShaper: (data: Omit<TaskWithRecurrenceInput, 'pattern'>) => string;
}

type TaskWithRecurrenceCreateResult = {
  readonly task: Task;
  readonly recurrence: TaskRecurrence;
  readonly isRecurrenceCreate: true;
  readonly isRecurrenceUpdate?: never;
  readonly isRecurrenceCancel?: never;
  readonly shouldDeleteRecurrence?: never;
  readonly overridesToUpdate: TaskOverride[];
};

type TaskWithRecurrenceUpdateResult = {
  readonly task: Task;
  readonly recurrence: TaskRecurrence;
  readonly isRecurrenceUpdate: true;
  readonly isRecurrenceCreate?: never;
  readonly isRecurrenceCancel?: never;
  readonly shouldDeleteRecurrence?: never;
  readonly overridesToUpdate: TaskOverride[];
};

type TaskWithRecurrenceCancelDeleteResult = {
  readonly task: Task;
  readonly recurrence: TaskRecurrence;
  readonly isRecurrenceCancel: true;
  readonly isRecurrenceCreate?: never;
  readonly isRecurrenceUpdate?: never;
  readonly shouldDeleteRecurrence: boolean;
  readonly overridesToDelete: TaskOverride[];
};

type TaskWithRecurrenceNoopResult = {
  readonly task: Task;
  readonly recurrence: null;
  readonly isRecurrenceCreate?: never;
  readonly isRecurrenceUpdate?: never;
  readonly isRecurrenceCancel?: never;
  readonly shouldDeleteRecurrence?: never;
  readonly overridesToDelete?: never;
};

type TaskWithRecurrenceReplaceResult =
  | TaskWithRecurrenceCreateResult
  | TaskWithRecurrenceUpdateResult
  | TaskWithRecurrenceCancelDeleteResult
  | TaskWithRecurrenceNoopResult;

class TaskWithRecurrenceService {
  ensureNotRepeatable(input: { type: 'virtual' | 'override'; recurrence?: unknown; taskId?: string | number }): void {
    if (input.recurrence == null) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `${input.type} дело не может быть повторяемым`,
      field: 'recurrence',
      taskId: typeof input.taskId === 'number' ? input.taskId : undefined,
    });
  }

  public finish(task: Task, patch: { timezone: string; type: TaskFinishStatus; reason?: string }) {
    if (task.recurrenceId != null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Дело - источник серии повторений не может быть завершено',
        field: 'recurrenceId',
        taskId: task.id,
      });
    }

    const taskToFinish = TaskFactory.finish(task, patch);

    return {
      taskToFinish,
    };
  }

  public softDelete(input: { task: Task }) {
    const { task } = input;

    if (task.recurrenceId != null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Дело - источник серии повторений не может быть удален',
        field: 'recurrenceId',
        taskId: task.id,
      });
    }

    const taskToDelete = TaskFactory.deleteSoft(task);

    return {
      taskToDelete,
    };
  }

  public deleteComplete(input: { task: Task }) {
    const { task } = input;

    if (task.recurrenceId != null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Дело - источник серии повторений не может быть удален',
        field: 'recurrenceId',
        taskId: task.id,
      });
    }

    const taskToDelete = TaskFactory.deleteComplete(task);

    return {
      taskToDelete,
    };
  }

  public create(input: {
    task: Task;
    recurrenceData: Omit<TaskWithRecurrenceInput, 'pattern'>;
    patternShaper: (data: Omit<TaskWithRecurrenceInput, 'pattern'>) => string;
  }): {
    draftRecurrence: TaskRecurrence;
  } {
    const { task, recurrenceData, patternShaper } = input;

    this.assertTaskPersisted(task);
    this.assertRecurrenceInvariants({
      taskId: task.id,
      taskStartDate: task.startDate,
      recurrenceStartDate: recurrenceData.startDate,
    });

    const draftRecurrence = TaskRecurrence.create({
      userId: task.userId,
      taskId: task.id,
      status: TaskRecurrenceStatus.ACTIVE,
      pattern: patternShaper(recurrenceData),
      timezone: TimezoneVo.create(recurrenceData.timezone),
      startDate: DateVo.create(recurrenceData.startDate),
      frequency: recurrenceData.frequency,
      weekstart: recurrenceData.weekstart ?? 0,
      untilDate: recurrenceData.untilDate != null ? DateVo.create(recurrenceData.untilDate) : undefined,
      interval: recurrenceData.interval,
      weekdays: recurrenceData.weekdays,
      monthdays: recurrenceData.monthdays != null ? MonthdaysVo.create(recurrenceData.monthdays) : undefined,
      yearmonths: recurrenceData.yearmonths != null ? YearmonthsVo.create(recurrenceData.yearmonths) : undefined,
    });

    return {
      draftRecurrence,
    };
  }

  public replace(input: TaskWithRecurrenceReplaceInput): TaskWithRecurrenceReplaceResult {
    const { task, taskPatch, currentRecurrence, currentOverrides = [], recurrencePatch, patternShaper } = input;

    this.assertOverridesBelongToRecurrence({
      task,
      currentRecurrence,
      currentOverrides,
    });

    const isCreateRecurrence = currentRecurrence == null && recurrencePatch != null;
    const isUpdateRecurrence = currentRecurrence != null && recurrencePatch != null;
    const isCancelRecurrence = currentRecurrence != null && recurrencePatch == null;

    if (isCreateRecurrence) {
      const pattern = patternShaper(recurrencePatch);
      const next = this.#create({
        task,
        taskPatch,
        currentOverrides,
        recurrence: { ...recurrencePatch, pattern },
      });

      return {
        ...next,
        isRecurrenceCreate: true,
      };
    }

    if (isUpdateRecurrence) {
      const pattern = patternShaper(recurrencePatch);
      const next = this.#update({
        task,
        taskPatch,
        currentRecurrence,
        currentOverrides,
        recurrencePatch: { ...recurrencePatch, pattern },
      });

      return {
        ...next,
        isRecurrenceUpdate: true,
      };
    }

    if (isCancelRecurrence) {
      const next = this.#cancel({
        task,
        taskPatch,
        currentRecurrence,
        currentOverrides,
        patternShaper,
      });

      return {
        ...next,
        isRecurrenceCancel: true,
      };
    }

    return {
      task: TaskFactory.replace(task, taskPatch),
      recurrence: null,
    };
  }

  #create(input: TaskWithRecurrenceCreateInput): {
    task: Task;
    recurrence: TaskRecurrence;
    overridesToUpdate: TaskOverride[];
  } {
    const { task, taskPatch, recurrence, currentOverrides } = input;

    const updatedTask = TaskFactory.replace(task, taskPatch);

    this.assertTaskPersisted(updatedTask);
    this.assertRecurrenceInvariants({
      taskId: updatedTask.id,
      taskStartDate: updatedTask.startDate,
      recurrenceStartDate: recurrence.startDate,
    });

    const overridesToUpdate = this.#updateRecurrenceStartToOverrides(currentOverrides, recurrence.startDate);

    return {
      overridesToUpdate,
      task: updatedTask,
      recurrence: TaskRecurrence.create({
        userId: updatedTask.userId,
        taskId: updatedTask.id,
        status: TaskRecurrenceStatus.ACTIVE,
        pattern: recurrence.pattern,
        timezone: TimezoneVo.create(recurrence.timezone),
        startDate: DateVo.create(recurrence.startDate),
        frequency: recurrence.frequency,
        weekstart: recurrence.weekstart ?? 0,
        untilDate: recurrence.untilDate != null ? DateVo.create(recurrence.untilDate) : undefined,
        interval: recurrence.interval,
        weekdays: recurrence.weekdays,
        monthdays: recurrence.monthdays != null ? MonthdaysVo.create(recurrence.monthdays) : undefined,
        yearmonths: recurrence.yearmonths != null ? YearmonthsVo.create(recurrence.yearmonths) : undefined,
      }),
    };
  }

  #update(input: TaskWithRecurrenceUpdateInput): {
    task: Task;
    recurrence: TaskRecurrence;
    overridesToUpdate: TaskOverride[];
  } {
    const { task, taskPatch, recurrencePatch, currentRecurrence, currentOverrides } = input;
    const updatedTask = TaskFactory.replace(task, taskPatch);
    const timezone = currentRecurrence?.timezone ?? recurrencePatch.timezone;

    this.assertRecurrenceInvariants({
      taskId: updatedTask.id,
      taskStartDate: updatedTask.startDate,
      recurrenceStartDate: recurrencePatch.startDate,
    });

    const overridesToUpdate = this.#updateRecurrenceStartToOverrides(currentOverrides, recurrencePatch.startDate);

    return {
      overridesToUpdate,
      task: updatedTask,
      recurrence:
        currentRecurrence == null
          ? TaskRecurrence.create({
              userId: updatedTask.userId,
              taskId: updatedTask.id,
              status: TaskRecurrenceStatus.ACTIVE,
              pattern: recurrencePatch.pattern,
              timezone: TimezoneVo.create(timezone),
              startDate: DateVo.create(recurrencePatch.startDate),
              frequency: recurrencePatch.frequency,
              weekstart: recurrencePatch.weekstart ?? 0,
              untilDate: recurrencePatch.untilDate != null ? DateVo.create(recurrencePatch.untilDate) : undefined,
              interval: recurrencePatch.interval,
              weekdays: recurrencePatch.weekdays,
              monthdays: recurrencePatch.monthdays != null ? MonthdaysVo.create(recurrencePatch.monthdays) : undefined,
              yearmonths:
                recurrencePatch.yearmonths != null ? YearmonthsVo.create(recurrencePatch.yearmonths) : undefined,
            })
          : currentRecurrence.replace({
              status: TaskRecurrenceStatus.ACTIVE,
              startDate: DateVo.create(recurrencePatch.startDate),
              pattern: recurrencePatch.pattern,
              frequency: recurrencePatch.frequency,
              weekstart: recurrencePatch.weekstart ?? 0,
              untilDate: recurrencePatch.untilDate != null ? DateVo.create(recurrencePatch.untilDate) : undefined,
              interval: recurrencePatch.interval,
              weekdays: recurrencePatch.weekdays,
              monthdays: recurrencePatch.monthdays != null ? MonthdaysVo.create(recurrencePatch.monthdays) : undefined,
              yearmonths:
                recurrencePatch.yearmonths != null ? YearmonthsVo.create(recurrencePatch.yearmonths) : undefined,
            }),
    };
  }

  #updateRecurrenceStartToOverrides(overrides: TaskOverride[], recurrenceStart: string) {
    return overrides.map((override) => {
      const newRecurrenceStart = timeAndDate(recurrenceStart);
      const overrideRecurrenceStart = timeAndDate(override.recurrenceStart)
        .hour(newRecurrenceStart.hour())
        .minute(newRecurrenceStart.minute())
        .second(newRecurrenceStart.second());

      return TaskOverride.restore({
        task: Task.restore({
          id: override.id,
          userId: override.userId,
          name: Name.create(override.name),
          groupId: override.groupId,
          description: override.description,
          priority: Priority.create(override.priority),
          weight: Weight.create(override.weight),
          startDate: DateVo.create(override.startDate),
          deadline: DateVo.create(override.deadline),
          status: override.status,
          endDate: override.endDate != null ? DateVo.create(override.endDate) : undefined,
          cancelReason: override.cancelReason,
          recurrenceId: override.recurrenceId,
        }),
        recurrenceId: override.recurrenceId,
        type: override.type,
        recurrenceStart: DateVo.create(overrideRecurrenceStart.valueOf()),
      });
    });
  }

  #cancel(input: TaskWithRecurrenceCancelInput): {
    task: Task;
    recurrence: TaskRecurrence;
    shouldDeleteRecurrence: boolean;
    overridesToDelete: TaskOverride[];
  } {
    const { task, taskPatch, currentRecurrence, currentOverrides, patternShaper } = input;

    const updatedTask = TaskFactory.replace(task, taskPatch);
    if (TaskWithRecurrenceService.canDeleteRecurrence(currentOverrides)) {
      return {
        task: updatedTask,
        recurrence: currentRecurrence,
        shouldDeleteRecurrence: true,
        overridesToDelete: currentOverrides,
      };
    }

    const closestOverride = maxBy(currentOverrides, (override) => timeAndDate(override.recurrenceStart).valueOf());
    const startDate = timeAndDate(closestOverride?.startDate).toISOString();
    const cancelDate = timeAndDate(closestOverride?.deadline).toISOString();

    const pattern = patternShaper({
      frequency: currentRecurrence.frequency.value,
      weekstart: currentRecurrence.weekstart,
      untilDate: cancelDate,
      interval: currentRecurrence.interval,
      weekdays: currentRecurrence.weekdays,
      monthdays: currentRecurrence.monthdays,
      yearmonths: currentRecurrence.yearmonths,
      startDate: currentRecurrence.startDate,
      timezone: currentRecurrence.timezone,
    });

    const canceledRecurrence = currentRecurrence.cancel({
      startDate: DateVo.create(DateVo.format(startDate)),
      cancelDate: DateVo.create(DateVo.format(cancelDate)),
      pattern,
    });

    return {
      task: updatedTask,
      recurrence: canceledRecurrence ?? null,
      shouldDeleteRecurrence: false,
      overridesToDelete: TaskWithRecurrenceService.overridesToDeleteFilter(currentOverrides),
    };
  }

  private assertTaskPersisted(task: Task): void {
    if (task.isDraft) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Невозможно создать recurrence для черновой Task',
        field: 'taskId',
      });
    }
  }

  static overrideStatusesToDelete = [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.CANCELED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ];

  static canDeleteRecurrence(overrides: TaskOverride[]): boolean {
    if (overrides.length <= 0) return true;
    return overrides.every((override) => TaskWithRecurrenceService.overrideStatusesToDelete.includes(override.status));
  }

  static overridesToDeleteFilter(overrides: TaskOverride[]): TaskOverride[] {
    return overrides.filter((override) => TaskWithRecurrenceService.overrideStatusesToDelete.includes(override.status));
  }

  private assertOverridesBelongToRecurrence(input: {
    task: Task;
    currentRecurrence: TaskRecurrence | null | undefined;
    currentOverrides: TaskOverride[];
  }): void {
    const { task, currentRecurrence, currentOverrides } = input;

    if (currentOverrides.length === 0) {
      return;
    }

    if (currentRecurrence == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Невозможно передать currentOverrides без currentRecurrence',
        field: 'currentOverrides',
        taskId: task.id,
      });
    }

    if (task.recurrenceId !== currentRecurrence.id) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Дело не принадлежит к recurrence: ${currentRecurrence.id}`,
        field: 'recurrenceId',
        taskId: task.id,
      });
    }

    const hasForeignOverride = currentOverrides.some((override) => override.recurrenceId !== currentRecurrence.id);
    if (hasForeignOverride) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Все currentOverrides должны принадлежать currentRecurrence',
        field: 'currentOverrides',
        taskId: task.id,
      });
    }
  }

  private assertRecurrenceInvariants(input: {
    taskId: number;
    taskStartDate?: string;
    recurrenceStartDate: string;
  }): void {
    const { taskId, taskStartDate, recurrenceStartDate } = input;

    if (taskStartDate == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Если Task имеет recurrence, startDate обязателен',
        field: 'startDate',
        taskId,
      });
    }

    if (!this.isSameDay({ left: taskStartDate, right: recurrenceStartDate })) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'startDate Task и TaskRecurrence.startDate должны быть в рамках одного дня',
        field: 'startDate',
        taskId,
      });
    }
  }

  private isSameDay(input: { left: string; right: string }): boolean {
    const { left, right } = input;
    return timeAndDate(left).format('YYYY-MM-DD') === timeAndDate(right).format('YYYY-MM-DD');
  }
}

export {
  TaskWithRecurrenceService,
  TaskWithRecurrenceInput,
  TaskWithRecurrenceCreateInput,
  TaskWithRecurrenceUpdateInput,
  TaskWithRecurrenceCancelInput,
  TaskWithRecurrenceReplaceInput,
  TaskWithRecurrenceReplaceResult,
};
