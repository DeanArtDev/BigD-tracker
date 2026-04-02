import { TaskRecurrenceValues } from '@/modules/tasks/application/types';
import { TaskIdBuilder, TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { numberToWeekdayMap, TaskStatus } from '@big-d/api-contracts';
import { DateVo, timeAndDate } from '@big-d/api-utils';
import { Inject, Injectable } from '@nestjs/common';
import { RRule } from 'rrule';
import { TasksViewMapper, TaskView } from '../dto';
import { GetRecurrencesByRange, GetRecurrenceTasksOverrides } from '../policies';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';
import { TaskCheckerService } from './task-checker.service';

@Injectable()
class TaskRecurrenceQueryService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
    private readonly taskCheckerService: TaskCheckerService,
  ) {}

  createRule(recurrence: TaskRecurrenceValues): RRule {
    function shapeRuleDate(date: string) {
      const localDate = timeAndDate(date);

      return new Date(
        Date.UTC(
          localDate.year(),
          localDate.month(),
          localDate.date(),
          localDate.hour(),
          localDate.minute(),
          localDate.second(),
          localDate.millisecond(),
        ),
      );
    }

    return new RRule({
      freq: recurrence.frequency,
      wkst: recurrence.weekstart,
      interval: recurrence.interval ?? 1,
      bymonth: recurrence.monthdays,
      byyearday: recurrence.yearmonths,
      byweekday: recurrence.weekdays?.map((wd) => numberToWeekdayMap[wd]),
      dtstart: shapeRuleDate(recurrence.startDate),
      until: recurrence.untilDate != null ? shapeRuleDate(recurrence.untilDate) : undefined,
    });
  }

  /**
   * Сервис валидно работает только с датами без таймзоны
   * не важно где было создано recurrence в любой таймзоне
   * дата и время будет одно и тоже
   * */
  async calculateTasks(
    input: { userId: number; from: string; to: string; group?: number[] } | { userId: number },
    filter: { from: string; to: string; group?: number[] },
    trx?: TaskTransaction,
  ): Promise<{ virtualViews: TaskView[]; recurrences: TaskRecurrence[] }> {
    const { userId } = input;

    const from = timeAndDate(filter.from).startOf('day').toDate();
    const to = timeAndDate(filter.to).endOf('day').toDate();

    const recurrences = await this.tasksOverridesRepository.getManyRecurrences(
      GetRecurrencesByRange({ userId, to }),
      trx,
    );

    const virtualViews: TaskView[] = [];

    const overrides = await this.tasksOverridesRepository.getManyOverrides(
      GetRecurrenceTasksOverrides({ userId, to }),
      trx,
    );

    const overridesMap = new Map(overrides.map((o) => [this.#getOverrideMapHashKey(o), o]));

    for (const recurrence of recurrences) {
      if (recurrence.isCanceled) {
        const overridesByRecurrenceId = Array.from(overridesMap.values()).filter(
          (o) => o.recurrenceId === recurrence.id,
        );

        for (const override of overridesByRecurrenceId) {
          overridesMap.delete(this.#getOverrideMapHashKey(override));

          if (this.#isOverrideSkipped({ from, to }, override)) {
            continue;
          }

          if (this.#isOverrideRender(override, filter)) {
            virtualViews.push(this.#shapeOverride(override));
          }
        }

        continue;
      }

      const rule = this.createRule({
        frequency: recurrence.frequency.value,
        weekstart: recurrence.weekstart,
        weekdays: recurrence.weekdays,
        interval: recurrence.interval,
        monthdays: recurrence.monthdays,
        yearmonths: recurrence.yearmonths,
        startDate: recurrence.startDate,
        untilDate: recurrence.untilDate,
      });

      const sourceTask = await this.taskCheckerService.ensureTaskExists({ taskId: recurrence.taskId, userId });
      const sourceTaskDurationDelta = Math.abs(timeAndDate(sourceTask.deadline).diff(sourceTask.startDate));
      const shiftedFrom = timeAndDate(from).subtract(sourceTaskDurationDelta, 'millisecond').startOf('day').toDate();

      const isSeriesGroupMatched = this.#isGroupMatched(filter.group, sourceTask.groupId);
      if (!isSeriesGroupMatched) continue;

      for (const occurrence of rule.between(shiftedFrom, to, true)) {
        const occurrenceStart = this.createTimePoint(occurrence, sourceTask.startDate);
        const startDate = timeAndDate(sourceTask.startDate)
          .year(occurrenceStart.year())
          .month(occurrenceStart.month())
          .date(occurrenceStart.date());
        const deadline = startDate.clone().add(sourceTaskDurationDelta, 'millisecond');

        if (startDate.toDate() > to || deadline.toDate() < from) continue;

        const overrideHashKey = TaskIdBuilder.wrapVirtualId({
          recurrenceId: recurrence.id,
          date: DateVo.format(occurrenceStart.toISOString()),
        });

        const override = overridesMap.get(overrideHashKey);

        if (this.#isOverrideSkipped({ to, from }, override)) {
          overridesMap.delete(overrideHashKey);
          continue;
        }

        if (override != null && this.#isOverrideRender(override, filter)) {
          virtualViews.push(this.#shapeOverride(override));
          overridesMap.delete(overrideHashKey);
        } else {
          virtualViews.push(
            TasksViewMapper.fromPlainToView({
              id: overrideHashKey,
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
    }

    for (const [, override] of overridesMap.entries()) {
      if (this.#isOverrideSkipped({ to, from }, override)) {
        continue;
      }

      if (override != null && this.#isOverrideRender(override, filter)) {
        virtualViews.push(this.#shapeOverride(override));
      }
    }

    return { virtualViews, recurrences };
  }

  public createTimePoint(occurrence: string | Date, date?: string) {
    const sourceStartDate = timeAndDate(date);

    return timeAndDate(occurrence)
      .hour(sourceStartDate.hour())
      .minute(sourceStartDate.minute())
      .second(sourceStartDate.second())
      .millisecond(sourceStartDate.millisecond());
  }

  #shapeOverride(override: TaskOverride) {
    const startDate = timeAndDate(override.startDate).toISOString();
    const deadline = override.deadline != null ? timeAndDate(override.deadline).toISOString() : undefined;

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

  #getOverrideMapHashKey(override: TaskOverride) {
    return TaskIdBuilder.wrapVirtualId({
      recurrenceId: override.recurrenceId,
      date: DateVo.format(override.recurrenceStart),
    });
  }

  #isOverrideSkipped({ from, to }: { from: Date; to: Date }, override?: TaskOverride): boolean {
    if (override == null) return false;
    if (override.isCancelled || override.isDeleted || override.isArchived || override.isMoved) {
      return true;
    }

    const start = timeAndDate(override.startDate).toDate();
    const deadline = timeAndDate(override.deadline).toDate();
    const isInFromToRange = start <= to && deadline >= from;
    return !isInFromToRange;
  }

  #isOverrideRender(override: TaskOverride, filter?: { group?: number[] }): boolean {
    return override.isOverride && this.#isGroupMatched(filter?.group, override.groupId);
  }

  #isGroupMatched(groupIds?: number[], groupId?: number): boolean {
    if (groupIds == null || groupIds.length === 0) {
      return true;
    }

    if (groupId == null) {
      return false;
    }

    return groupIds.includes(groupId);
  }
}

export { TaskRecurrenceQueryService };
