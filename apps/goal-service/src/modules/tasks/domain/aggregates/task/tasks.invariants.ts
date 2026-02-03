import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';

function assertTaskDates(input: { start?: DateVo; end?: DateVo; deadline?: DateVo }): void {
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
}

function assertEndDateNotInThePast(input: { end?: DateVo }): void {
  const { end } = input;

  if (end != null && end.isBefore(new Date().toISOString())) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `end:${end.value} can't be in the past`,
      field: 'end',
    });
  }
}

function assertDeadlineInThePast(input: { deadline?: DateVo }): void {
  const { deadline } = input;

  if (deadline != null && deadline.isBefore(new Date().toISOString())) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `deadline:${deadline.value} can't be in the past`,
      field: 'deadline',
    });
  }
}

function assertStartDateNotInThePast(input: { start?: DateVo }): void {
  const { start } = input;

  if (start != null && start.isBefore(new Date().toISOString())) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `startDate:${start.value} can't be in the past`,
      field: 'startDate',
    });
  }
}

function assertHasCancelReason(input: { status: TaskStatus; reason?: string }): void {
  if (input.status === TaskStatus.CANCELLED && input.reason == null) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `cancelReason must not be empty`,
      field: 'cancelReason',
    });
  }
}

function assertTaskReplace(input: { status: TaskStatus; endDate?: string }): void {
  const { status, endDate } = input;

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

  if (endDate != null) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be updated after ending`,
      field: 'endDate',
    });
  }
}

function assertTaskDeleteSoft(input: { status: TaskStatus }): void {
  const { status } = input;

  if ([TaskStatus.DELETED, TaskStatus.OVERDUE, TaskStatus.COMPLETED].includes(status)) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be deleted at current status: ${status}`,
      field: 'status',
    });
  }
}

function assertTaskAssignToGroup(input: { status: TaskStatus }): void {
  const { status } = input;

  if (
    [
      TaskStatus.COMPLETED,
      TaskStatus.OVERDUE,
      TaskStatus.CANCELLED,
      TaskStatus.ARCHIVED,
      TaskStatus.DELETED,
    ].includes(status)
  ) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be assigned at current status: ${status}`,
      field: 'status',
    });
  }
}

function assertFinishTask(input: { status: TaskStatus }): void {
  const { status } = input;

  if (
    [
      TaskStatus.COMPLETED,
      TaskStatus.OVERDUE,
      TaskStatus.CANCELLED,
      TaskStatus.ARCHIVED,
      TaskStatus.DELETED,
    ].includes(status)
  ) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be finished at current status: ${status}`,
      field: 'status',
    });
  }
}

function assertTaskUnassignFromGroup(input: { status: TaskStatus }): void {
  const { status } = input;

  if (
    [
      TaskStatus.COMPLETED,
      TaskStatus.OVERDUE,
      TaskStatus.CANCELLED,
      TaskStatus.ARCHIVED,
      TaskStatus.DELETED,
    ].includes(status)
  ) {
    throw new ExceptionTaskDomainInvalidInvariant({
      message: `Task can't be unassigned at current status: ${status}`,
      field: 'status',
    });
  }
}

export {
  assertTaskDates,
  assertTaskDeleteSoft,
  assertHasCancelReason,
  assertTaskReplace,
  assertTaskAssignToGroup,
  assertTaskUnassignFromGroup,
  assertEndDateNotInThePast,
  assertDeadlineInThePast,
  assertStartDateNotInThePast,
  assertFinishTask,
};
