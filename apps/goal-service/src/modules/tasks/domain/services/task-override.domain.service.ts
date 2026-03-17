import { Priority, TaskIdBuilder, Weight } from '@/modules/tasks/domain';
import { taskStatusToOverrideTypeMap } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { Task, TaskFactory, TaskOverride, TaskOverrideFactory, TaskRecurrence } from '../aggregates/task';
import { ExceptionTaskDomainInvalidInvariant } from '../exceptions';
import { taskServiceAsserts } from './task-service-asserts';

interface OverrideData {
  readonly overrideId: number;
  readonly recurrenceId: number;
  readonly date: string;
}

class TaskOverrideDomainService {
  clone(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence; override: TaskOverride }) {
    const { sourceTask, currentRecurrence, override } = input;

    const { overrideData } = this.#assertOverrideId(input);
    this.#assertDependenciesConsistency(input);
    this.#assertTaskPersisted(sourceTask);
    this.#assertOverrideAndOverrideIdDataMatched({
      recurrence: currentRecurrence,
      overrideData,
      override,
      taskId: sourceTask.id,
    });

    const task = this.#restoreTaskFromOverride(override);

    return {
      task: TaskFactory.clone(task),
    };
  }

  delete(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence; override: TaskOverride }) {
    const { sourceTask, override, currentRecurrence } = input;

    const { overrideData } = this.#assertOverrideId(input);
    this.#assertDependenciesConsistency(input);
    this.#assertTaskPersisted(sourceTask);
    this.#assertOverrideAndOverrideIdDataMatched({
      recurrence: currentRecurrence,
      overrideData,
      override,
      taskId: sourceTask.id,
    });

    const task = this.#restoreTaskFromOverride(override);
    const deletedTask = TaskFactory.deleteSoft(task);
    const deletedOverride = TaskOverrideFactory.delete(override, deletedTask);

    return {
      override: deletedOverride,
    };
  }

  finish(input: {
    taskId: string;
    sourceTask: Task;
    currentRecurrence: TaskRecurrence;
    override: TaskOverride;
    timezone: string;
  }) {
    const { sourceTask, override, currentRecurrence } = input;

    const { overrideData } = this.#assertOverrideId(input);
    this.#assertDependenciesConsistency(input);
    this.#assertTaskPersisted(sourceTask);
    this.#assertOverrideAndOverrideIdDataMatched({
      recurrence: currentRecurrence,
      overrideData,
      override,
      taskId: sourceTask.id,
    });

    const task = this.#restoreTaskFromOverride(override);
    const finishedTask = TaskFactory.finish(task, input.timezone);
    const finishedOverride = TaskOverrideFactory.finish(override, finishedTask);

    return {
      override: finishedOverride,
    };
  }

  replace(input: {
    taskId: string;
    sourceTask: Task;
    currentRecurrence: TaskRecurrence;
    override: TaskOverride;
    overridePatch: {
      name: string;
      userId: number;
      description?: string;
      priority: number;
      weight: number;
      startDate?: string;
      deadline?: string;
    };
  }) {
    const { override, sourceTask, overridePatch, currentRecurrence } = input;

    const { overrideData } = this.#assertOverrideId(input);
    this.#assertDependenciesConsistency(input);
    this.#assertTaskPersisted(sourceTask);
    this.#assertOverrideAndOverrideIdDataMatched({
      recurrence: currentRecurrence,
      overrideData,
      override,
      taskId: sourceTask.id,
    });

    const task = this.#restoreTaskFromOverride(override);
    const overrideToReplace = TaskOverrideFactory.replace(override, {
      task: TaskFactory.replace(task, overridePatch),
      type: taskStatusToOverrideTypeMap[task.status],
    });

    return {
      overrideToReplace,
    };
  }

  create(input: {
    taskId: string;
    sourceTask: Task;
    currentRecurrence: TaskRecurrence;
    recurrenceStart: string;
    overridePatch: {
      name: string;
      userId: number;
      description?: string;
      priority: number;
      weight: number;
      startDate?: string;
      deadline?: string;
    };
  }) {
    const { sourceTask, currentRecurrence, overridePatch, recurrenceStart } = input;

    this.#assertOverrideIdCreation(input);
    this.#assertDependenciesConsistency(input);

    const taskToReplace = TaskFactory.replace(sourceTask, overridePatch);
    const overrideToCreate = TaskOverrideFactory.create({
      task: taskToReplace,
      type: taskStatusToOverrideTypeMap[taskToReplace.status],
      recurrenceId: currentRecurrence.id,
      recurrenceStart,
    });

    return {
      overrideToCreate,
    };
  }

  public ensureOverrideTaskNotRepeatable(input: { recurrence?: unknown; taskId?: string | number }): void {
    if (input.recurrence != null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Оверрайд дела не может быть повторяемым`,
        field: 'recurrence',
        taskId: input.taskId,
      });
    }
  }

  #restoreTaskFromOverride(override: TaskOverride): Task {
    return Task.restore({
      id: override.id,
      userId: override.userId,
      groupId: override.groupId,
      name: Name.restore(override.name),
      description: override.description,
      priority: Priority.restore(override.priority),
      weight: Weight.restore(override.weight),
      cancelReason: override.cancelReason,
      startDate: override.startDate != null ? DateVo.restore(override.startDate) : undefined,
      deadline: override.deadline != null ? DateVo.restore(override.deadline) : undefined,
      endDate: override.endDate != null ? DateVo.restore(override.endDate) : undefined,
      status: override.status,
      recurrenceId: override.recurrenceId,
    });
  }

  #assertTaskPersisted(task: Task): void {
    if (task.isDraft) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Дело не должно быть драфтом',
        field: 'taskId',
      });
    }
  }

  #assertDependenciesConsistency(input: { sourceTask: Task }) {
    const { sourceTask } = input;

    taskServiceAsserts.ensureRepeatableSourceTask(sourceTask);
  }

  #assertOverrideAndOverrideIdDataMatched(input: {
    taskId: number;
    overrideData: OverrideData;
    recurrence: TaskRecurrence;
    override: TaskOverride;
  }) {
    const { taskId, overrideData, override } = input;

    taskServiceAsserts.ensureRecurrenceStartMatched({
      taskId,
      date: overrideData.date,
      expectedDate: override.recurrenceStart,
    });

    taskServiceAsserts.ensureRecurrenceIdMatched({
      taskId,
      currentRecurrenceId: override.recurrenceId,
      nextRecurrenceId: overrideData.recurrenceId,
    });
  }

  #assertOverrideId(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }): {
    overrideData: OverrideData;
  } {
    const { taskId, sourceTask, currentRecurrence } = input;
    const { override: overrideData } = TaskIdBuilder.unwrapId(taskId) ?? {};

    if (overrideData == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId,
        message: 'Дело не является оверрайдом',
        field: 'id',
      });
    }

    taskServiceAsserts.ensureRecurrenceIdMatched({
      taskId: sourceTask.id,
      currentRecurrenceId: sourceTask.recurrenceId,
      nextRecurrenceId: currentRecurrence.id,
    });

    taskServiceAsserts.ensureRecurrenceIdMatched({
      taskId: sourceTask.id,
      currentRecurrenceId: currentRecurrence.id,
      nextRecurrenceId: overrideData.recurrenceId,
    });

    taskServiceAsserts.ensureRecurrenceAndTaskMatched({
      taskId: sourceTask.id,
      expectedTaskId: currentRecurrence.taskId,
    });

    return { overrideData };
  }

  #assertOverrideIdCreation(input: { sourceTask: Task; currentRecurrence: TaskRecurrence }) {
    const { sourceTask, currentRecurrence } = input;

    taskServiceAsserts.ensureRecurrenceIdMatched({
      taskId: sourceTask.id,
      currentRecurrenceId: sourceTask.recurrenceId,
      nextRecurrenceId: currentRecurrence.id,
    });

    taskServiceAsserts.ensureRecurrenceAndTaskMatched({
      taskId: sourceTask.id,
      expectedTaskId: currentRecurrence.taskId,
    });
  }
}

export { TaskOverrideDomainService };
