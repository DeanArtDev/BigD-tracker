import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import {
  assertStartDateNotInThePast,
  assertTaskAssignToGroup,
  assertTaskDates,
  assertTaskDeleteSoft,
  assertHasCancelReason,
  assertTaskUnassignFromGroup,
  assertTaskReplace,
} from './tasks.invariants';

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

  it('rejects end dates before start dates', () => {
    expect(() =>
      assertTaskDates({
        start: DateVo.create(futureDate(2)),
        end: DateVo.create(futureDate(1)),
      }),
    ).toThrow();
  });

  it('rejects deadlines before start dates', () => {
    expect(() =>
      assertTaskDates({
        start: DateVo.create(futureDate(3)),
        deadline: DateVo.create(futureDate(2)),
      }),
    ).toThrow();
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
});
