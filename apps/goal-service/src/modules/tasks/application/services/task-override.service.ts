import { TaskRecurrenceValues } from '@/modules/tasks/application/types';
import { TaskIdBuilder, TaskOverride, TaskRecurrence, TaskRecurrenceFactory } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { numberToWeekdayMap, TaskStatus } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { timeAndDate, TimeAndDate, TimeAndDateValue } from '@shared/date-and-time';
import { GoalServiceRequestContext } from '@shared/request-context';
import { compact, keyBy } from 'lodash';
import { RRule } from 'rrule';
import { TasksViewMapper, TaskView } from '../dto';
import { GetRecurrencesByRange, GetTasksOverrides } from '../policies';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';
import {
  TaskRecurrenceById,
  TaskRecurrenceByTaskId,
  TaskRecurrenceByUserId,
  tasksCombinators,
} from '../specifications';
import { TaskCheckerService } from './task-checker.service';

const { and } = tasksCombinators;

@Injectable()
class TaskOverrideService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
    private readonly taskCheckerService: TaskCheckerService,
  ) {}

  async getRecurrence(
    input: { userId: number; id?: number; taskId?: number },
    trx?: TaskTransaction,
  ): Promise<TaskRecurrence | null> {
    return await this.tasksOverridesRepository.getOneRecurrence(
      and(
        ...compact([
          TaskRecurrenceByUserId(input.userId),
          input.id != null && TaskRecurrenceById(input.id),
          input.taskId != null && TaskRecurrenceByTaskId(input.taskId),
        ]),
      ),
      trx,
    );
  }

  async upsertOverride(input: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride> {
    return await this.tasksOverridesRepository.upsertOverride(input, trx);
  }

  async upsertRecurrence(
    input: TaskRecurrenceValues & { userId: number; taskId: number },
    trx?: TaskTransaction,
  ): Promise<TaskRecurrence> {
    const { taskId, userId, ...recurrence } = input;

    const reccur = await this.getRecurrence({ userId, taskId }, trx);
    const isCreate = reccur == null;

    const request = GoalServiceRequestContext.getStore()?.state;
    const recurrenceDate = { timezone: request?.userTimezone ?? 'UTC', ...recurrence };
    const pattern = this.createRule(recurrenceDate).toString();
    const recurrenceToCreate = TaskRecurrenceFactory.create({
      userId,
      taskId,
      pattern,
      ...recurrenceDate,
    });

    return await this.tasksOverridesRepository.upsertRecurrence(
      isCreate ? recurrenceToCreate : TaskRecurrenceFactory.update(reccur, { ...recurrence, pattern }),
      trx,
    );
  }

  createRule(recurrence: TaskRecurrenceValues & { timezone: string }): RRule {
    const safeEndDate = recurrence.untilDate ?? timeAndDate().add(40, 'day').toISOString();

    return new RRule({
      freq: recurrence.frequency,
      tzid: recurrence.timezone,
      wkst: recurrence.weekstart,
      interval: recurrence.interval ?? 1,
      bymonth: recurrence.monthdays,
      byyearday: recurrence.yearmonths,
      byweekday: recurrence.weekdays?.map((wd) => numberToWeekdayMap[wd]),
      dtstart: new Date(recurrence.startDate),
      until: new Date(safeEndDate),
    });
  }

  async calculateTasks(
    input: { userId: number; from: string; to: string },
    trx?: TaskTransaction,
  ): Promise<{ virtualViews: TaskView[]; recurrences: TaskRecurrence[] }> {
    const { userId } = input;

    const request = GoalServiceRequestContext.getStore()?.state;
    const userTimezone = request?.userTimezone ?? 'UTC';
    const { from, to } = this.#datesToTZUtc({ from: input.from, to: input.to }, userTimezone);

    const recurrences = await this.tasksOverridesRepository.getManyRecurrences(
      GetRecurrencesByRange({ userId, to, from }),
      trx,
    );

    const overrides = await this.tasksOverridesRepository.getManyOverrides(
      GetTasksOverrides({ userId, from, to, recurrenceIds: recurrences.map((me) => me.id) }),
      trx,
    );

    const overridesMap = keyBy(overrides, ({ recurrenceId, recurrenceStart }) =>
      TaskIdBuilder.wrapVirtualId({ recurrenceId, date: recurrenceStart }),
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

      for (const occurrence of rule.between(from, to, true)) {
        const sourceTask = await this.taskCheckerService.ensureTaskExists({ taskId: recurrence.taskId, userId });
        const occurrenceStart = this.createTimePoint(
          occurrence.toISOString(),
          recurrence.timezone,
          sourceTask.startDate,
        );

        const hashKey = TaskIdBuilder.wrapVirtualId({ recurrenceId: recurrence.id, date: occurrenceStart });
        const override = overridesMap[hashKey] as TaskOverride | undefined;
        if (override?.isCancelled || override?.isDeleted || override?.isArchived || override?.isMoved) continue;

        if (override?.isOverride) {
          // Привидение дат к пользовательской зоне с сохранением времени в utc
          const startDate = timeAndDate(override?.startDate).tz(recurrence.timezone).utc(true);
          const deadline = timeAndDate(override?.deadline).tz(recurrence.timezone).utc(true);

          virtualViews.push(
            TasksViewMapper.fromPlainToView({
              id: TaskIdBuilder.wrapOverrideId({
                date: occurrenceStart,
                overrideId: override.id,
                recurrenceId: recurrence.id,
              }),
              userId: sourceTask.userId,
              groupId: sourceTask.groupId,
              name: override?.name ?? sourceTask.name,
              description: override?.description ?? sourceTask.description,
              cancelReason: override?.cancelReason ?? sourceTask.cancelReason,
              priority: override?.priority ?? sourceTask.priority,
              weight: override?.weight ?? sourceTask.weight,
              status: override?.status ?? TaskStatus.IN_PROGRESS,
              startDate: this.#applyTimeParts(occurrence, startDate).tz(recurrence.timezone, true).utc().toISOString(),
              deadline: deadline.toISOString(),
              endDate: override?.endDate ?? sourceTask?.endDate,
            }),
          );
        } else {
          const startDate = timeAndDate(sourceTask.startDate).tz(recurrence.timezone).utc(true);
          const deadline = timeAndDate(sourceTask.deadline).tz(recurrence.timezone).utc(true);

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
              startDate: this.#applyTimeParts(occurrence, startDate).tz(recurrence.timezone, true).utc().toISOString(),
              deadline: this.#applyTimeParts(occurrence, deadline).tz(recurrence.timezone, true).utc().toISOString(),
            }),
          );
        }
      }
    }

    return { virtualViews, recurrences };
  }

  public createTimePoint(occurrence: string, timezone: string, date?: string): string {
    const sourceStartDate = timeAndDate(date).tz(timezone).utc(true);
    return this.#applyTimeParts(occurrence, sourceStartDate).tz(timezone, true).utc().toISOString();
  }

  #datesToTZUtc(dates: { from: string; to: string }, timezone: string) {
    return {
      from: timeAndDate.tz(dates.from, 'YYYY-MM-DD', timezone).startOf('day').utc().toDate(),
      to: timeAndDate.tz(dates.to, 'YYYY-MM-DD', timezone).endOf('day').utc().toDate(),
    };
  }

  #applyTimeParts(date: TimeAndDateValue, patch: TimeAndDateValue): TimeAndDate {
    const target = timeAndDate(date);
    const source = timeAndDate(patch);

    return target.hour(source.hour()).minute(source.minute()).second(source.second()).millisecond(source.millisecond());
  }
}

export { TaskOverrideService };
