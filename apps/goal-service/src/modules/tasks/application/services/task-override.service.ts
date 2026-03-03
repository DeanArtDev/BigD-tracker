import { TaskOverride } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { TaskStatus } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { applyTimeParts, timeAndDate } from '@shared/date-and-time';
import { keyBy } from 'lodash';
import { RRule } from 'rrule';
import { TaskVirtualView } from '../dto';
import { GetMasterEvents, GetTasksOverrides } from '../policies';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';

const numberToWeekdayMap = {
  0: RRule.MO,
  1: RRule.TU,
  2: RRule.WE,
  3: RRule.TH,
  4: RRule.FR,
  5: RRule.SA,
  6: RRule.SU,
};

@Injectable()
class TaskOverrideService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
  ) {}

  async getVirtualViews(
    input: { userId: number; from: Date; to: Date },
    trx?: TaskTransaction,
  ): Promise<TaskVirtualView[]> {
    const { to, from, userId } = input;
    const masterEvents = await this.tasksOverridesRepository.getManyMasterEvents(
      GetMasterEvents({ userId, to, from }),
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
    const overridesMap = keyBy(overrides, (o) => `${o.masterTaskId}:${o.startDate}`);

    const virtualViews: TaskVirtualView[] = [];
    for (const masterEvent of masterEvents) {
      if (masterEvent.isRecurrence()) {
        const safeEndDate =
          masterEvent.recurrence.end ?? timeAndDate().utc(false).add(90, 'day').toJSON();
        const rule = new RRule({
          tzid: 'Asia/Novosibirsk',
          byweekday: masterEvent.recurrence.weekdays?.map((wd) => numberToWeekdayMap[wd]),
          freq: masterEvent.recurrence.frequency,
          dtstart: new Date(masterEvent.recurrence.start),
          until: new Date(safeEndDate),
        });

        for (const date of rule.between(from, to, true)) {
          const isosDate = date.toISOString();

          const override = overridesMap[`${masterEvent.id}:${isosDate}`] as
            | TaskOverride
            | undefined;
          if (override?.isCancelled || override?.isDeleted || override?.isArchived) continue;

          const id = `v:${masterEvent.id}:${isosDate}`;

          if (override?.isOverride) {
            const startDate = override?.startDate ?? masterEvent.startDate;
            const deadline = override?.deadline ?? masterEvent.deadline;

            virtualViews.push(
              TaskVirtualView.restore({
                id,
                userId: masterEvent.userId,
                groupId: masterEvent.groupId,
                name: override?.name ?? masterEvent.name,
                description: override?.description ?? masterEvent.description,
                cancelReason: override?.cancelReason ?? masterEvent.cancelReason,
                priority: override?.priority ?? masterEvent.priority,
                weight: override?.weight ?? masterEvent.weight,
                status: override?.status ?? TaskStatus.IN_PROGRESS,
                startDate:
                  startDate != null ? applyTimeParts(date, startDate).toISOString() : undefined,
                deadline:
                  deadline != null ? applyTimeParts(date, deadline).toISOString() : undefined,
                endDate: override?.endDate,
              }),
            );
          } else {
            const startDate = masterEvent.startDate;
            const deadline = masterEvent.deadline;

            virtualViews.push(
              TaskVirtualView.restore({
                id,
                userId: masterEvent.userId,
                description: masterEvent.description,
                endDate: masterEvent.endDate,
                cancelReason: masterEvent.cancelReason,
                name: masterEvent.name,
                priority: masterEvent.priority,
                weight: masterEvent.weight,
                status: TaskStatus.IN_PROGRESS,
                groupId: masterEvent.groupId,
                startDate:
                  startDate != null ? applyTimeParts(date, startDate).toISOString() : undefined,
                deadline:
                  deadline != null ? applyTimeParts(date, deadline).toISOString() : undefined,
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
