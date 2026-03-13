import { TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { futureDate, pastDate } from '@shared/__tests__';
import { assertHasCancelReason, assertTaskReplace, taskAsserts } from '../tasks.invariants';
import { Priority, Weight } from '../value-objects';

describe('task invariants', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rejects end dates in the past', () => {
    expect(() =>
      taskAsserts.endDateNotInThePast({
        end: DateVo.create(pastDate(1)),
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

  it('allows datesIntersections when one of dates is missing', () => {
    expect(() =>
      taskAsserts.datesIntersections({
        start: DateVo.create(futureDate(3)),
      }),
    ).not.toThrow();

    expect(() =>
      taskAsserts.datesIntersections({
        end: DateVo.create(futureDate(3)),
      }),
    ).not.toThrow();
  });

  it('allows valid date ordering', () => {
    expect(() =>
      taskAsserts.datesIntersections({
        start: DateVo.restore('2026-04-02T00:00:00.000Z'),
        end: DateVo.restore('2026-04-03T00:00:00.000Z'),
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

  it('requires start and deadline for recurrence-based replace', () => {
    expect(() =>
      taskAsserts.neededRecurrenceFields({
        start: DateVo.create(futureDate(1)),
      }),
    ).toThrow();

    expect(() =>
      taskAsserts.neededRecurrenceFields({
        deadline: DateVo.create(futureDate(2)),
      }),
    ).toThrow();

    expect(() =>
      taskAsserts.neededRecurrenceFields({
        start: DateVo.create(futureDate(1)),
        deadline: DateVo.create(futureDate(2)),
      }),
    ).not.toThrow();
  });

  it('rejects partly-replaceable fields when priority changes', () => {
    expect(() =>
      taskAsserts.partlyReplaceableFields(
        {
          id: 1,
          status: TaskStatus.COMPLETED,
          priority: Priority.create(2),
          weight: Weight.create(10),
        },
        {
          priority: Priority.create(3),
          weight: Weight.create(10),
        },
      ),
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
