import { Task, TaskIdBuilder, TaskOverride } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { numberToWeekdayMap, TaskStatus } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { applyTimeParts, timeAndDate } from '@shared/date-and-time';
import { keyBy } from 'lodash';
import { RRule } from 'rrule';
import { TasksViewMapper, TaskView } from '../dto';
import { GetMasterEventsByRange, GetTasksOverrides } from '../policies';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';
import { TaskById, TaskByUserId, TaskHasRecurrence, tasksCombinators } from '../specifications';

const { and } = tasksCombinators;

@Injectable()
class TaskOverrideService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
  ) {}

  async getMasterEvent(input: { userId: number; masterEventId: number }, trx?: TaskTransaction): Promise<Task | null> {
    return await this.tasksOverridesRepository.getOneMasterEvent(
      and(TaskByUserId(input.userId), TaskById(input.masterEventId), TaskHasRecurrence()),
      trx,
    );
  }

  async upsertOverride(input: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride> {
    return await this.tasksOverridesRepository.upsertOverride(input, trx);
  }

  async getVirtualViews(
    input: { userId: number; from: Date; to: Date; userTimezone?: string },
    trx?: TaskTransaction,
  ): Promise<TaskView[]> {
    const { to, from, userId } = input;
    const masterEvents = await this.tasksOverridesRepository.getManyMasterEvents(
      GetMasterEventsByRange({ userId, to, from }),
      trx,
    );

    const overrides = await this.tasksOverridesRepository.getManyOverrides(
      GetTasksOverrides({
        userId,
        from,
        to,
        masterEventIds: masterEvents.map((me) => me.id),
      }),
      trx,
    );

    const overridesMap = keyBy(overrides, ({ masterTaskId, occurrenceStart }) =>
      TaskIdBuilder.wrapVirtualId({
        masterTaskId: masterTaskId,
        timestamp: new Date(occurrenceStart).getTime(),
      }),
    );

    const virtualViews: TaskView[] = [];

    for (const masterEvent of masterEvents) {
      if (masterEvent.isRecurrence()) {
        const safeEndDate = masterEvent.recurrence.end ?? timeAndDate().utc(false).add(40, 'day').toJSON();

        const rule = new RRule({
          tzid: input.userTimezone,
          byweekday: masterEvent.recurrence.weekdays?.map((wd) => numberToWeekdayMap[wd]),
          freq: masterEvent.recurrence.frequency,
          dtstart: new Date(masterEvent.recurrence.start),
          until: new Date(safeEndDate),
        });

        for (const date of rule.between(from, to, true)) {
          const timestamp = date.getTime();

          const hasKey = TaskIdBuilder.wrapVirtualId({ masterTaskId: masterEvent.id, timestamp });
          const override = overridesMap[hasKey] as TaskOverride | undefined;
          if (override?.isCancelled || override?.isDeleted || override?.isArchived) continue;

          if (override?.isOverride) {
            const startDate = override?.startDate ?? masterEvent.startDate;
            const deadline = override?.deadline ?? masterEvent.deadline;

            virtualViews.push(
              TasksViewMapper.fromPlainToView({
                id: TaskIdBuilder.wrapOverrideId({
                  timestamp,
                  overrideId: override.id,
                  masterTaskId: masterEvent.id,
                }),
                userId: masterEvent.userId,
                groupId: masterEvent.groupId,
                name: override?.name ?? masterEvent.name,
                description: override?.description ?? masterEvent.description,
                cancelReason: override?.cancelReason ?? masterEvent.cancelReason,
                priority: override?.priority ?? masterEvent.priority,
                weight: override?.weight ?? masterEvent.weight,
                status: override?.status ?? TaskStatus.IN_PROGRESS,
                startDate: startDate != null ? applyTimeParts(date, startDate).toISOString() : undefined,
                deadline: deadline != null ? applyTimeParts(date, deadline).toISOString() : undefined,
                endDate: override?.endDate ?? masterEvent?.endDate,
              }),
            );
          } else {
            const startDate = masterEvent.startDate;
            const deadline = masterEvent.deadline;

            virtualViews.push(
              TasksViewMapper.fromPlainToView({
                id: hasKey,
                userId: masterEvent.userId,
                description: masterEvent.description,
                endDate: masterEvent.endDate,
                cancelReason: masterEvent.cancelReason,
                name: masterEvent.name,
                priority: masterEvent.priority,
                weight: masterEvent.weight,
                status: TaskStatus.IN_PROGRESS,
                groupId: masterEvent.groupId,
                startDate: startDate != null ? applyTimeParts(date, startDate).toISOString() : undefined,
                deadline: deadline != null ? applyTimeParts(date, deadline).toISOString() : undefined,
              }),
            );
          }
        }
      }
    }

    return virtualViews;
  }
}

export { TaskOverrideService };
