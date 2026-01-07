import { ExceptionDomainInvalidInvariant } from '@/modules/tasks/domain/errors';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';

function assertTaskDates(input: { start?: DateVo; end?: DateVo; deadline?: DateVo }): void {
  const { start, end, deadline } = input;

  if (start != null && start.isBefore(new Date().toISOString())) {
    throw new ExceptionDomainInvalidInvariant({
      message: `startDate:${start.value} can't be in the past`,
      field: 'startDate',
    });
  }

  if (end != null && end.isBefore(new Date().toISOString())) {
    throw new ExceptionDomainInvalidInvariant({
      message: `end:${end.value} can't be in the past`,
      field: 'end',
    });
  }

  if (start != null && end != null) {
    if (start.equals(end) || start.isAfter(end.value)) {
      throw new ExceptionDomainInvalidInvariant({
        message: `startDate:${start.value} must not be after or equal to endDate: ${end.value}`,
        field: 'startDate',
      });
    }
  }

  if (start != null && deadline != null) {
    if (start.equals(deadline) || start.isAfter(deadline.value)) {
      throw new ExceptionDomainInvalidInvariant({
        message: `startDate:${start.value} must not be after or equal to deadline:${deadline.value}`,
        field: 'startDate',
      });
    }
  }
}

function assertHasCancelReason(input: { status: TaskStatus; reason?: string }): void {
  if (input.status === TaskStatus.CANCELLED && input.reason == null) {
    throw new ExceptionDomainInvalidInvariant({
      message: `cancelReason must not be empty`,
      field: 'cancelReason',
    });
  }
}

function assertTaskUpdate(input: { status: TaskStatus; endDate?: string }): void {
  const { status, endDate } = input;

  if (
    [
      TaskStatus.DELETED,
      TaskStatus.CANCELLED,
      TaskStatus.ARCHIVED,
      TaskStatus.OVERDUE,
      TaskStatus.COMPLETED,
    ].includes(status)
  ) {
    throw new ExceptionDomainInvalidInvariant({
      message: `Task can't be updated at current status: ${status}`,
      field: 'status',
    });
  }

  if (endDate != null) {
    throw new ExceptionDomainInvalidInvariant({
      message: `Task can't be updated after ending`,
      field: 'endDate',
    });
  }
}

export { assertTaskDates, assertHasCancelReason, assertTaskUpdate };
