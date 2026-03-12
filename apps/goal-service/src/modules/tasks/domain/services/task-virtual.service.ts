import { taskStatusToOverrideTypeMap } from '@big-d/api-contracts';
import { timeAndDate } from '@big-d/api-utils';
import { Task, TaskFactory, TaskOverrideFactory, TaskRecurrence } from '../aggregates/task';
import { taskServiceAsserts } from './task-service-asserts';

class TaskVirtualService {
  clone(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }) {
    const { sourceTask, currentRecurrence } = input;

    const { virtualData } = this.#assertDependenciesConsistency(input);

    const { startDate, deadline } = this.#shapeRelatedDates({
      taskId: sourceTask.id,
      startDate: sourceTask.startDate,
      virtualDate: virtualData.date,
      deadline: sourceTask.deadline,
      timezone: currentRecurrence.timezone,
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

    const { virtualData } = this.#assertDependenciesConsistency(input);

    const { startDate, deadline } = this.#shapeRelatedDates({
      taskId: sourceTask.id,
      startDate: sourceTask.startDate,
      virtualDate: virtualData.date,
      deadline: sourceTask.deadline,
      timezone: currentRecurrence.timezone,
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

  finish(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }) {
    const { sourceTask, currentRecurrence } = input;

    const { virtualData } = this.#assertDependenciesConsistency(input);

    const { startDate, deadline } = this.#shapeRelatedDates({
      taskId: sourceTask.id,
      virtualDate: virtualData.date,
      startDate: sourceTask.startDate,
      deadline: sourceTask.deadline,
      timezone: currentRecurrence.timezone,
    });

    const virtualTask = this.#createVirtualTaskFromSource({
      sourceTask,
      startDate: startDate.toISOString(),
      deadline: deadline.toISOString(),
    });

    const finishedTask = TaskFactory.finish(virtualTask);
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
      startDate,
      deadline,
    });
  }

  #assertDependenciesConsistency(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }) {
    const { taskId, sourceTask, currentRecurrence } = input;

    const virtualData = taskServiceAsserts.ensureVirtualId(taskId);
    taskServiceAsserts.ensureRecurrenceIdMatchesTaskId({
      taskId,
      expectedRecurrenceId: currentRecurrence.id,
      actualRecurrenceId: virtualData.recurrenceId,
      message: 'Дело принадлежит другой серии',
    });
    taskServiceAsserts.ensureSourceTaskBelongsToRecurrence({ taskId, sourceTask, currentRecurrence });
    taskServiceAsserts.ensureRepeatableSourceTask({ taskId, sourceTask });

    return { virtualData };
  }

  #shapeRelatedDates(input: {
    taskId: number;
    virtualDate: string;
    timezone: string;
    startDate?: string;
    deadline?: string;
  }) {
    const { timezone, startDate } = input;

    taskServiceAsserts.ensureDatesAreExistent({
      taskId: input.taskId,
      startDate: input.startDate,
      deadline: input.deadline,
    });

    const virtualTaskStart = timeAndDate(input.virtualDate).tz(timezone, true).utc();
    const delta = timeAndDate(startDate).diff(input.deadline);
    const deadline = virtualTaskStart.add(Math.abs(delta), 'millisecond');

    return {
      startDate: virtualTaskStart,
      deadline,
    };
  }
}

export { TaskVirtualService };
