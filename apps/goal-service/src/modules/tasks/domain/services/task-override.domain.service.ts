import { Task, TaskOverride, TaskOverrideFactory, TaskRecurrence } from '../aggregates/task';
import { taskServiceAsserts } from './task-service-asserts';

class TaskOverrideDomainService {
  delete(input: { taskId: string; sourceTask: Task; currentRecurrence: TaskRecurrence; override: TaskOverride }) {
    const { taskId, sourceTask, currentRecurrence, override } = input;

    const overrideData = taskServiceAsserts.ensureOverrideId(taskId);
    taskServiceAsserts.ensureRecurrenceIdMatchesTaskId({
      taskId,
      expectedRecurrenceId: currentRecurrence.id,
      actualRecurrenceId: overrideData.recurrenceId,
      message: 'Запрашиваемое дело на удаление принадлежит другой серии',
    });
    taskServiceAsserts.ensureSourceTaskBelongsToRecurrence({ taskId, sourceTask, currentRecurrence });
    taskServiceAsserts.ensureRecurrenceIsNotCanceled(currentRecurrence);
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

    const deletedOverride = TaskOverrideFactory.delete(override);

    return {
      override: deletedOverride,
    };
  }
}

export { TaskOverrideDomainService };
