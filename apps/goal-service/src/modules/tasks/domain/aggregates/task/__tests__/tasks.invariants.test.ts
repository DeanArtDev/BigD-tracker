import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import {
  assertDeadlineInThePast,
  assertEndDateNotInThePast,
  assertHasCancelReason,
  assertStartDateNotInThePast,
  assertTaskAssignToGroup,
  assertTaskDates,
  assertTaskDeleteSoft,
  assertTaskReplace,
  assertTaskUnassignFromGroup,
} from '../tasks.invariants';

const futureDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

const pastDate = (offsetDays: number) =>
  new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000).toISOString();

describe('task invariants', () => {
  it('rejects start dates in the past', () => {
    expect(() =>
      assertStartDateNotInThePast({
        start: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('allows start dates in the future', () => {
    expect(() =>
      assertStartDateNotInThePast({
        start: DateVo.create(futureDate(1)),
      }),
    ).not.toThrow();
  });

  it('rejects end dates in the past', () => {
    expect(() =>
      assertEndDateNotInThePast({
        end: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('rejects deadlines in the past', () => {
    expect(() =>
      assertDeadlineInThePast({
        deadline: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('rejects end dates before or equal start dates', () => {
    expect(() =>
      assertTaskDates({
        start: DateVo.create(futureDate(2)),
        end: DateVo.create(futureDate(1)),
      }),
    ).toThrow();

    expect(() =>
      assertTaskDates({
        start: DateVo.create(futureDate(2)),
        end: DateVo.create(futureDate(2)),
      }),
    ).toThrow();
  });

  it('rejects deadlines before or equal start dates', () => {
    expect(() =>
      assertTaskDates({
        start: DateVo.create(futureDate(3)),
        deadline: DateVo.create(futureDate(2)),
      }),
    ).toThrow();

    expect(() =>
      assertTaskDates({
        start: DateVo.create(futureDate(3)),
        deadline: DateVo.create(futureDate(3)),
      }),
    ).toThrow();
  });

  it('allows valid date ordering', () => {
    expect(() =>
      assertTaskDates({
        start: DateVo.create(futureDate(1)),
        end: DateVo.create(futureDate(2)),
        deadline: DateVo.create(futureDate(3)),
      }),
    ).not.toThrow();
  });

  it('rejects updates for terminal statuses', () => {
    expect(() =>
      assertTaskReplace({
        status: TaskStatus.COMPLETED,
      }),
    ).toThrow();
  });

  it('rejects updates after ending', () => {
    expect(() =>
      assertTaskReplace({
        status: TaskStatus.NOT_STARTED,
        endDate: futureDate(1),
      }),
    ).toThrow();
  });

  it('rejects soft delete for completed tasks', () => {
    expect(() =>
      assertTaskDeleteSoft({
        status: TaskStatus.COMPLETED,
      }),
    ).toThrow();
  });

  it('rejects moving tasks in terminal states', () => {
    expect(() =>
      assertTaskAssignToGroup({
        status: TaskStatus.CANCELLED,
      }),
    ).toThrow();
  });

  it('rejects unassigning tasks in terminal states', () => {
    expect(() =>
      assertTaskUnassignFromGroup({
        status: TaskStatus.ARCHIVED,
      }),
    ).toThrow();
  });

  it('requires cancel reason for cancelled status', () => {
    expect(() =>
      assertHasCancelReason({
        status: TaskStatus.CANCELLED,
      }),
    ).toThrow();
  });

  it('allows cancel reason for cancelled status', () => {
    expect(() =>
      assertHasCancelReason({
        status: TaskStatus.CANCELLED,
        reason: 'No longer needed',
      }),
    ).not.toThrow();
  });

  it('skips cancel reason requirement for non-cancelled status', () => {
    expect(() =>
      assertHasCancelReason({
        status: TaskStatus.IN_PROGRESS,
      }),
    ).not.toThrow();
  });
});
