import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { taskAsserts, assertHasCancelReason, assertTaskReplace } from '../tasks.invariants';

const futureDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

const pastDate = (offsetDays: number) =>
  new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000).toISOString();

describe('task invariants', () => {
  it('rejects start dates in the past', () => {
    expect(() =>
      taskAsserts.startDateInThePast({
        start: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('allows start dates in the future', () => {
    expect(() =>
      taskAsserts.startDateInThePast({
        start: DateVo.create(futureDate(1)),
      }),
    ).not.toThrow();
  });

  it('rejects end dates in the past', () => {
    expect(() =>
      taskAsserts.endDateNotInThePast({
        end: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('rejects deadlines in the past', () => {
    expect(() =>
      taskAsserts.deadlineInThePast({
        deadline: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('rejects end dates before or equal start dates', () => {
    expect(() =>
      taskAsserts.datesIntersections({
        start: DateVo.create(futureDate(2)),
        end: DateVo.create(futureDate(1)),
      }),
    ).toThrow();

    expect(() =>
      taskAsserts.datesIntersections({
        start: DateVo.create(futureDate(2)),
        end: DateVo.create(futureDate(2)),
      }),
    ).toThrow();
  });

  it('rejects deadlines before or equal start dates', () => {
    expect(() =>
      taskAsserts.datesIntersections({
        start: DateVo.create(futureDate(3)),
        deadline: DateVo.create(futureDate(2)),
      }),
    ).toThrow();

    expect(() =>
      taskAsserts.datesIntersections({
        start: DateVo.create(futureDate(3)),
        deadline: DateVo.create(futureDate(3)),
      }),
    ).toThrow();
  });

  it('allows valid date ordering', () => {
    expect(() =>
      taskAsserts.datesIntersections({
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
