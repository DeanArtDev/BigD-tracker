import { taskStatusToOverrideTypeMap } from '@big-d/api-contracts';
import { timeAndDate } from '@shared/date-and-time';
import { Task, TaskFactory, TaskOverrideFactory, TaskRecurrence } from '../aggregates/task';
import { taskServiceAsserts } from './task-service-asserts';

class TaskVirtualService {
  delete(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence }) {
    const { taskId, sourceTask, currentRecurrence } = input;

    const virtualData = taskServiceAsserts.ensureVirtualId(taskId);
    taskServiceAsserts.ensureRecurrenceIdMatchesTaskId({
      taskId,
      expectedRecurrenceId: currentRecurrence.id,
      actualRecurrenceId: virtualData.recurrenceId,
      message: 'Дело принадлежит другой серии',
    });
    taskServiceAsserts.ensureRecurrenceIsNotCanceled(currentRecurrence);
    taskServiceAsserts.ensureSourceTaskBelongsToRecurrence({ taskId, sourceTask, currentRecurrence });
    taskServiceAsserts.ensureRepeatableSourceTask({ taskId, sourceTask });

    const virtualTaskStart = timeAndDate(virtualData.date).tz(currentRecurrence.timezone, true).utc();
    const delta = timeAndDate(sourceTask.startDate).diff(sourceTask.deadline);
    const deadline = virtualTaskStart.add(Math.abs(delta), 'millisecond');

    const replacedTask = TaskFactory.replace(sourceTask, {
      name: sourceTask.name,
      description: sourceTask.description,
      priority: sourceTask.priority,
      weight: sourceTask.weight,
      startDate: virtualTaskStart.toISOString(),
      deadline: deadline.toISOString(),
    });
    const deletedTask = TaskFactory.deleteSoft(replacedTask);
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
}

export { TaskVirtualService };
