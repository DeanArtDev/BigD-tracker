import { Priority, Weight } from '@/modules/tasks/domain';
import { DateVo, Name } from '@big-d/api-utils';
import { Task, TaskFactory, TaskOverride, TaskOverrideFactory, TaskRecurrence } from '../aggregates/task';
import { taskServiceAsserts } from './task-service-asserts';

class TaskOverrideDomainService {
  clone(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence; override: TaskOverride }) {
    const { override } = input;

    this.#assertDependenciesConsistency(input);

    const task = this.#restoreTaskFromOverride(override);

    return {
      task: TaskFactory.clone(task),
    };
  }

  delete(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence; override: TaskOverride }) {
    const { override } = input;

    this.#assertDependenciesConsistency(input);

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
    const { override } = input;

    this.#assertDependenciesConsistency(input);

    const task = this.#restoreTaskFromOverride(override);
    const finishedTask = TaskFactory.finish(task, input.timezone);
    const finishedOverride = TaskOverrideFactory.finish(override, finishedTask);

    return {
      override: finishedOverride,
    };
  }

  #assertDependenciesConsistency(input: {
    taskId: string;
    sourceTask: Task;
    currentRecurrence: TaskRecurrence;
    override: TaskOverride;
  }) {
    const { taskId, sourceTask, currentRecurrence, override } = input;

    const overrideData = taskServiceAsserts.ensureOverrideId(taskId);
    taskServiceAsserts.ensureRecurrenceIdMatchesTaskId({
      taskId,
      expectedRecurrenceId: currentRecurrence.id,
      actualRecurrenceId: overrideData.recurrenceId,
      message: 'Запрашиваемое дело принадлежит другой серии',
    });
    taskServiceAsserts.ensureSourceTaskBelongsToRecurrence({ taskId, sourceTask, currentRecurrence });
    taskServiceAsserts.ensureRepeatableSourceTask({ taskId, sourceTask });
    taskServiceAsserts.ensureOverrideDateMatchesTaskId({
      taskId,
      overrideDate: override.recurrenceStart,
      expectedDate: overrideData.date,
    });
    taskServiceAsserts.ensureRecurrenceIdMatchesTaskId({
      taskId,
      expectedRecurrenceId: currentRecurrence.id,
      actualRecurrenceId: override.recurrenceId,
      message: 'Оверрайд принадлежит другой серии',
    });
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
}

export { TaskOverrideDomainService };
