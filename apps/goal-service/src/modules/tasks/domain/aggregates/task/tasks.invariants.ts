import { Priority, Weight } from '@/modules/tasks/domain';
import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';

interface PartlyFields {
  readonly id: number;
  readonly status: TaskStatus;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly recurrence?: string;
}

const taskAsserts = {
  endDateNotInThePast: (input: { end?: DateVo }) => {
    const { end } = input;

    if (end != null && end.isBefore(new Date().toISOString())) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `end:${end.value} can't be in the past`,
        field: 'end',
      });
    }
  },

  deadlineInThePast: (input: { taskId?: number; deadline?: DateVo }) => {
    const { deadline, taskId } = input;

    if (deadline != null && deadline.isBefore(new Date().toISOString())) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `deadline:${deadline.value} can't be in the past`,
        field: 'deadline',
        taskId,
      });
    }
  },

  startDateInThePast: (input: { taskId?: number; start?: DateVo }) => {
    const { start, taskId } = input;

    if (start != null && start.isBefore(new Date().toISOString())) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `startDate:${start.value} can't be in the past`,
        field: 'startDate',
        taskId,
      });
    }
  },

  datesIntersections: (input: { start?: DateVo; end?: DateVo; deadline?: DateVo }) => {
    const { start, end, deadline } = input;

    if (start != null && end != null) {
      if (start.equals(end) || start.isAfter(end.value)) {
        throw new ExceptionTaskDomainInvalidInvariant({
          message: `startDate:${start.value} must not be after or equal to endDate: ${end.value}`,
          field: 'startDate',
        });
      }
    }

    if (start != null && deadline != null) {
      if (start.equals(deadline) || start.isAfter(deadline.value)) {
        throw new ExceptionTaskDomainInvalidInvariant({
          message: `startDate:${start.value} must not be after or equal to deadline:${deadline.value}`,
          field: 'startDate',
        });
      }
    }
  },

  partlyReplaceableFields(currentState: PartlyFields, path: Omit<PartlyFields, 'id' | 'status'>) {
    if (path.deadline != null && !currentState.deadline?.equals(path.deadline)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'deadline',
        taskId: currentState.id,
      });
    }

    if (path.startDate != null && !currentState.startDate?.equals(path.startDate)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'startDate',
        taskId: currentState.id,
      });
    }

    if (path.priority != null && !currentState.priority?.equals(path.priority)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'priority',
        taskId: currentState.id,
      });
    }

    if (path.weight != null && !currentState.weight?.equals(path.weight)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'weight',
        taskId: currentState.id,
      });
    }

    if (path.recurrence != null && currentState.recurrence !== currentState.recurrence) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Field can't be updated at this status: ${currentState.status}`,
        field: 'recurrence',
        taskId: currentState.id,
      });
    }
  },
};

function assertHasCancelReason(input: { status: TaskStatus; reason?: string }): void {
  if (input.status === TaskStatus.CANCELLED && input.reason == null) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `cancelReason must not be empty`,
      field: 'cancelReason',
    });
  }
}

function assertTaskReplace(input: { status: TaskStatus; endDate?: string }): void {
  const { status } = input;

  if (
    [TaskStatus.DELETED, TaskStatus.ARCHIVED, TaskStatus.OVERDUE, TaskStatus.COMPLETED].includes(
      status,
    )
  ) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be updated at current status: ${status}`,
      field: 'status',
    });
  }
}

export { taskAsserts, assertHasCancelReason, assertTaskReplace };
