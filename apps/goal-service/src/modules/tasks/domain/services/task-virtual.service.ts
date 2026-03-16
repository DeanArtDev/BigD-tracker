import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { taskStatusToOverrideTypeMap } from '@big-d/api-contracts';
import { DateVo, timeAndDate } from '@big-d/api-utils';
import { Task, TaskFactory, TaskIdBuilder, TaskOverrideFactory, TaskRecurrence } from '../aggregates/task';
import { taskServiceAsserts } from './task-service-asserts';

class TaskVirtualService {
  clone(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }) {
    const { sourceTask } = input;

    const { virtualData } = this.#assertVirtualId(input);
    this.#assertDependenciesConsistency(input);
    this.#assertTaskPersisted(input.sourceTask);

    const { startDate, deadline } = this.#shapeDates({
      taskId: sourceTask.id,
      startDate: sourceTask.startDate,
      virtualDate: virtualData.date,
      deadline: sourceTask.deadline,
    });

    const virtualTask = this.#createVirtualTaskFromSource({
      sourceTask,
      startDate: startDate.toISOString(),
      deadline: deadline.toISOString(),
    });

    return {
      task: TaskFactory.clone(virtualTask),
    };
  }

  delete(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }) {
    const { sourceTask, currentRecurrence } = input;

    const { virtualData } = this.#assertVirtualId(input);
    this.#assertDependenciesConsistency(input);
    this.#assertTaskPersisted(input.sourceTask);

    const { startDate, deadline } = this.#shapeDates({
      taskId: sourceTask.id,
      startDate: sourceTask.startDate,
      virtualDate: virtualData.date,
      deadline: sourceTask.deadline,
    });

    const virtualTask = this.#createVirtualTaskFromSource({
      sourceTask,
      startDate: startDate.toISOString(),
      deadline: deadline.toISOString(),
    });

    const deletedTask = TaskFactory.deleteSoft(virtualTask);
    const createdOverrideDraft = TaskOverrideFactory.create({
      task: deletedTask,
      type: taskStatusToOverrideTypeMap[deletedTask.status],
      recurrenceId: currentRecurrence.id,
      recurrenceStart: virtualData.date,
    });

    return {
      override: createdOverrideDraft,
    };
  }

  finish(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence; timezone: string }) {
    const { sourceTask, currentRecurrence } = input;

    const { virtualData } = this.#assertVirtualId(input);
    this.#assertDependenciesConsistency(input);
    this.#assertTaskPersisted(input.sourceTask);

    const { startDate, deadline } = this.#shapeDates({
      taskId: sourceTask.id,
      virtualDate: virtualData.date,
      startDate: sourceTask.startDate,
      deadline: sourceTask.deadline,
    });

    const virtualTask = this.#createVirtualTaskFromSource({
      sourceTask,
      startDate: startDate.toISOString(),
      deadline: deadline.toISOString(),
    });

    const finishedTask = TaskFactory.finish(virtualTask, input.timezone);
    const createdOverrideDraft = TaskOverrideFactory.create({
      task: finishedTask,
      type: taskStatusToOverrideTypeMap[finishedTask.status],
      recurrenceId: currentRecurrence.id,
      recurrenceStart: virtualData.date,
    });

    return {
      override: createdOverrideDraft,
    };
  }

  public ensureVirtualTaskNotRepeatable(input: { recurrence?: unknown; taskId?: string | number }): void {
    if (input.recurrence != null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Виртуальное дело не может быть повторяемым`,
        field: 'recurrence',
        taskId: input.taskId,
      });
    }
  }

  #createVirtualTaskFromSource(input: { sourceTask: Task; startDate: string; deadline: string }): Task {
    const { sourceTask, startDate, deadline } = input;

    return TaskFactory.create({
      userId: sourceTask.userId,
      groupId: sourceTask.groupId,
      recurrenceId: sourceTask.recurrenceId,
      name: sourceTask.name,
      description: sourceTask.description,
      priority: sourceTask.priority,
      weight: sourceTask.weight,
      startDate: DateVo.format(startDate),
      deadline: DateVo.format(deadline),
    });
  }

  #assertDependenciesConsistency(input: { sourceTask: Task }) {
    const { sourceTask } = input;

    taskServiceAsserts.ensureRepeatableSourceTask(sourceTask);
  }

  #shapeDates(input: { taskId: number; virtualDate: string; startDate?: string; deadline?: string }) {
    const { startDate } = input;
    const virtualTaskStart = timeAndDate(input.virtualDate);
    const delta = timeAndDate(startDate).diff(input.deadline);
    const deadline = virtualTaskStart.add(Math.abs(delta), 'millisecond');

    return {
      startDate: virtualTaskStart,
      deadline,
    };
  }

  #assertTaskPersisted(task: Task): void {
    if (task.isDraft) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Дело не должно быть драфтом',
        field: 'taskId',
      });
    }
  }

  #assertVirtualId(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }): {
    virtualData: { recurrenceId: number; date: string };
  } {
    const { taskId, sourceTask, currentRecurrence } = input;
    const { virtual } = TaskIdBuilder.unwrapId(taskId) ?? {};

    if (virtual == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        taskId,
        message: 'Дело не является виртуальным',
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
      nextRecurrenceId: virtual.recurrenceId,
    });

    taskServiceAsserts.ensureRecurrenceAndTaskMatched({
      taskId: sourceTask.id,
      expectedTaskId: currentRecurrence.taskId,
    });

    return { virtualData: virtual };
  }
}

export { TaskVirtualService };
