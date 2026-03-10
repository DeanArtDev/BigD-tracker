import { TaskRecurrenceValues } from '@/modules/tasks/application/types';
import { TaskIdBuilder, TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { numberToWeekdayMap, TaskStatus } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { timeAndDate } from '@shared/date-and-time';
import { GoalServiceRequestContext } from '@shared/request-context';
import { RRule } from 'rrule';
import { TasksViewMapper, TaskView } from '../dto';
import { GetRecurrencesByRange, GetTasksOverrides } from '../policies';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';
import { TaskCheckerService } from './task-checker.service';

@Injectable()
class TaskRecurrenceQueryService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
    private readonly taskCheckerService: TaskCheckerService,
  ) {}

  createRule(recurrence: TaskRecurrenceValues & { timezone: string }): RRule {
    return new RRule({
      freq: recurrence.frequency,
      tzid: recurrence.timezone,
      wkst: recurrence.weekstart,
      interval: recurrence.interval ?? 1,
      bymonth: recurrence.monthdays,
      byyearday: recurrence.yearmonths,
      byweekday: recurrence.weekdays?.map((wd) => numberToWeekdayMap[wd]),
      dtstart: new Date(recurrence.startDate),
      until: recurrence.untilDate != null ? new Date(recurrence.untilDate) : undefined,
    });
  }

  async calculateTasks(
    input: { userId: number; from: string; to: string },
    trx?: TaskTransaction,
  ): Promise<{ virtualViews: TaskView[]; recurrences: TaskRecurrence[] }> {
    const { userId } = input;

    const request = GoalServiceRequestContext.getStore()?.state;
    const userTimezone = request?.userTimezone ?? 'UTC';

    const { from: userTzFrom, to: userTzTo } = this.#datesToTZUtc({ from: input.from, to: input.to }, userTimezone);
    const recurrences = await this.tasksOverridesRepository.getManyRecurrences(
      GetRecurrencesByRange({ userId, to: userTzTo, from: userTzFrom }),
      trx,
    );

    const virtualViews: TaskView[] = [];

    for (const recurrence of recurrences) {
      const rule = this.createRule({
        frequency: recurrence.frequency.value,
        weekstart: recurrence.weekstart,
        weekdays: recurrence.weekdays,
        interval: recurrence.interval,
        monthdays: recurrence.monthdays,
        yearmonths: recurrence.yearmonths,
        startDate: recurrence.startDate,
        untilDate: recurrence.untilDate,
        timezone: recurrence.timezone,
      });

      const sourceTask = await this.taskCheckerService.ensureTaskExists({ taskId: recurrence.taskId, userId });

      const { from, to } = this.#datesToTZUtc({ from: input.from, to: input.to }, recurrence.timezone);
      const overrides = await this.tasksOverridesRepository.getManyOverrides(
        GetTasksOverrides({ userId, from, to, recurrenceIds: [recurrence.id] }),
        trx,
      );
      const overridesMap = new Map(
        overrides.map((o) => [
          TaskIdBuilder.wrapVirtualId({ recurrenceId: o.recurrenceId, date: o.recurrenceStart }),
          o,
        ]),
      );

      for (const occurrence of rule.between(from, to, true)) {
        const occurrenceStart = this.createTimePoint(occurrence, recurrence.timezone, sourceTask.startDate);

        const hashKey = TaskIdBuilder.wrapVirtualId({
          recurrenceId: recurrence.id,
          date: occurrenceStart.toISOString(),
        });
        const override = overridesMap.get(hashKey);

        if (override?.isCancelled || override?.isDeleted || override?.isArchived || override?.isMoved) continue;

        if (override?.isOverride) {
          virtualViews.push(this.#shapeOverride(override, recurrence.timezone));
          overridesMap.delete(hashKey);
        } else {
          const startDate = timeAndDate(sourceTask.startDate).tz(recurrence.timezone).date(occurrenceStart.date());
          const deadline = timeAndDate(sourceTask.deadline).tz(recurrence.timezone).date(occurrenceStart.date());

          virtualViews.push(
            TasksViewMapper.fromPlainToView({
              id: hashKey,
              userId: sourceTask.userId,
              description: sourceTask.description,
              endDate: sourceTask.endDate,
              cancelReason: sourceTask.cancelReason,
              name: sourceTask.name,
              priority: sourceTask.priority,
              weight: sourceTask.weight,
              status: TaskStatus.IN_PROGRESS,
              groupId: sourceTask.groupId,
              startDate: startDate.toISOString(),
              deadline: deadline.toISOString(),
            }),
          );
        }
      }

      for (const [, override] of overridesMap.entries()) {
        if (override?.isCancelled || override?.isDeleted || override?.isArchived || override?.isMoved) continue;
        if (override?.isOverride) {
          virtualViews.push(this.#shapeOverride(override, recurrence.timezone));
        }
      }

      overridesMap.clear();
    }

    return { virtualViews, recurrences };
  }

  public createTimePoint(occurrence: string | Date, timezone: string, date?: string) {
    const sourceStartDate = timeAndDate(date).tz(timezone).utc(true);

    return timeAndDate(occurrence)
      .tz(timezone)
      .utc(true)
      .hour(sourceStartDate.hour())
      .minute(sourceStartDate.minute())
      .second(sourceStartDate.second())
      .millisecond(sourceStartDate.millisecond());
  }

  #shapeOverride(override: TaskOverride, recurrenceTimezone: string) {
    const startDate = timeAndDate(override.startDate).tz(recurrenceTimezone).utc().toISOString();
    const deadline =
      override.deadline != null ? timeAndDate(override.deadline).tz(recurrenceTimezone).utc().toISOString() : undefined;

    return TasksViewMapper.fromPlainToView({
      id: TaskIdBuilder.wrapOverrideId({
        date: override.recurrenceStart,
        overrideId: override.id,
        recurrenceId: override.recurrenceId,
      }),
      userId: override.userId,
      groupId: override.groupId,
      name: override?.name,
      description: override?.description,
      cancelReason: override?.cancelReason,
      priority: override?.priority,
      weight: override?.weight,
      status: override?.status ?? TaskStatus.IN_PROGRESS,
      startDate,
      deadline,
      endDate: override?.endDate,
    });
  }

  #datesToTZUtc(dates: { from: string; to: string }, timezone: string) {
    return {
      from: timeAndDate.tz(dates.from, 'YYYY-MM-DD', timezone).startOf('day').utc().toDate(),
      to: timeAndDate.tz(dates.to, 'YYYY-MM-DD', timezone).endOf('day').utc().toDate(),
    };
  }
}

export { TaskRecurrenceQueryService };
