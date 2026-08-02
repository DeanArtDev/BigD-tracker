import {
  createEvent,
  dateToPlainDate,
  dateToZonedDateTime,
  generateUniKey,
  temporalToDate,
  type Event as DayflowEvent,
  ViewType,
} from '@dayflow/core';
import { GroupId } from '@/entity/planner/groups';
import { Task, TaskDomain, TaskId } from '@/entity/planner/tasks';
import { Override } from '@/shared/lib';
import timeAndDate from '@/shared/lib/time';
import { TaskPriority, TaskStatus } from '@/shared/transport/graphql';
import { EMPTY_GROUP_ID } from './constants';

interface DiaryDialogDefaultValues {
  readonly deadline?: Date;
  readonly description?: string;
  readonly groupId?: GroupId;
  readonly name?: string;
  readonly priority?: TaskPriority;
  readonly startDate?: Date;
  readonly status?: TaskStatus;
}

interface DiaryDialogCreateParams {
  readonly allDay?: boolean;
  readonly calendarId: string;
  readonly date: Date;
  readonly defaultValues?: DiaryDialogDefaultValues;
  readonly viewType?: ViewType;
}

interface DiaryDialogPasteParams {
  readonly calendarId: string;
  readonly date: Date;
  readonly timeZone: string;
  readonly viewType?: ViewType;
}

type TaskUpdateData = Override<Task<GroupId>, { startDate: string; deadline: string }>;

type DiaryEventMeta = Pick<Task<GroupId>, 'priority' | 'status'> & Record<string, unknown>;

type DiaryEvent = Override<DayflowEvent, { meta: DiaryEventMeta }>;

class DiaryDialogActions {
  static create({ allDay, calendarId, date, defaultValues, viewType }: DiaryDialogCreateParams): DiaryEvent {
    const start = timeAndDate(defaultValues?.startDate ?? date);
    const isAllDay = allDay ?? (viewType === ViewType.MONTH || viewType === ViewType.YEAR);
    const end =
      defaultValues?.deadline != null
        ? timeAndDate(defaultValues.deadline)
        : isAllDay
          ? start.endOf('day')
          : start.add(1, 'hour');

    return {
      ...createEvent({
        id: generateUniKey(),
        title: defaultValues?.name ?? '',
        description: defaultValues?.description,
        start: start.toDate(),
        end: end.toDate(),
        allDay: isAllDay,
        calendarId,
      }),
      meta: {
        priority: defaultValues?.priority ?? TaskDomain.defaultFields.priority,
        status: defaultValues?.status ?? TaskDomain.defaultFields.status,
      },
    };
  }

  static update(task: TaskUpdateData): DiaryEvent {
    return DiaryDialogActions.mapTaskToEvent(task);
  }

  static paste(event: DayflowEvent, { calendarId, date, timeZone, viewType }: DiaryDialogPasteParams): DiaryEvent {
    const copiedStart = timeAndDate(temporalToDate(event.start));
    const copiedEnd = timeAndDate(temporalToDate(event.end));
    const duration = copiedEnd.diff(copiedStart, 'millisecond');
    let start = timeAndDate(date);
    const isDateOnlyView = viewType === ViewType.MONTH || viewType === ViewType.YEAR;
    const isMidnight = start.hour() === 0 && start.minute() === 0;
    const copiedEventHasTime = copiedStart.hour() !== 0 || copiedStart.minute() !== 0;

    if (!event.allDay && (isDateOnlyView || (isMidnight && copiedEventHasTime))) {
      start = start
        .set('hour', copiedStart.hour())
        .set('minute', copiedStart.minute())
        .set('second', copiedStart.second())
        .set('millisecond', copiedStart.millisecond());
    }

    const end = duration > 0 ? start.add(duration, 'millisecond') : start.add(1, 'hour');

    return {
      ...event,
      id: generateUniKey(),
      start: event.allDay ? dateToPlainDate(start.toDate()) : dateToZonedDateTime(start.toDate(), timeZone),
      end: event.allDay ? dateToPlainDate(end.toDate()) : dateToZonedDateTime(end.toDate(), timeZone),
      calendarId,
      meta: DiaryDialogActions.getTaskMeta(event),
    };
  }

  static mapEventToTask(event: DayflowEvent): Task<GroupId> {
    const start = timeAndDate(temporalToDate(event.start));
    let end = timeAndDate(temporalToDate(event.end));

    if (event.allDay && end.valueOf() <= start.valueOf()) end = start.endOf('day');

    const meta = DiaryDialogActions.getTaskMeta(event);

    return {
      id: event.id as TaskId,
      name: event.title,
      description: event.description,
      status: meta.status,
      priority: meta.priority,
      groupId: DiaryDialogActions.mapCalendarIdToGroupId(event.calendarId),
      startDate: TaskDomain.dateToTaskStandard(start.toDate()),
      deadline: TaskDomain.dateToTaskStandard(end.toDate()),
    };
  }

  static mapTaskToEvent(task: TaskUpdateData): DiaryEvent {
    return {
      ...createEvent({
        id: task.id,
        title: task.name,
        description: task.description ?? undefined,
        start: timeAndDate(task.startDate).toDate(),
        end: timeAndDate(task.deadline).toDate(),
        allDay: false,
        calendarId: task.groupId?.toString() ?? EMPTY_GROUP_ID,
      }),
      meta: {
        priority: task.priority,
        status: task.status,
      },
    };
  }

  static withTaskMeta(event: DayflowEvent): DiaryEvent {
    return { ...event, meta: DiaryDialogActions.getTaskMeta(event) };
  }

  private static getTaskMeta(event: DayflowEvent): DiaryEventMeta {
    const status = event.meta?.status;
    const priority = event.meta?.priority;

    return {
      ...event.meta,
      status: Object.values(TaskStatus).includes(status as TaskStatus)
        ? (status as TaskStatus)
        : TaskDomain.defaultFields.status,
      priority: Object.values(TaskPriority).includes(priority as TaskPriority)
        ? (priority as TaskPriority)
        : TaskDomain.defaultFields.priority,
    };
  }

  private static mapCalendarIdToGroupId(calendarId?: string): GroupId | undefined {
    if (calendarId == null || calendarId === EMPTY_GROUP_ID) return undefined;

    const groupId = Number(calendarId);
    return Number.isFinite(groupId) ? (groupId as GroupId) : undefined;
  }
}

export {
  DiaryDialogActions,
  type DiaryDialogCreateParams,
  type DiaryDialogDefaultValues,
  type DiaryDialogPasteParams,
  type DiaryEvent,
  type DiaryEventMeta,
};
