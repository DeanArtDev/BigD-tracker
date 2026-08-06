import {
  createEvent,
  dateToPlainDate,
  dateToZonedDateTime,
  type Event as DayflowEvent,
  generateUniKey,
  temporalToDate,
  ViewType,
} from '@dayflow/core';
import { GroupId } from '@/entity/planner/groups';
import { TaskDomain, TaskId } from '@/entity/planner/tasks';
import timeAndDate from '@/shared/lib/time';
import { DiaryTask, TaskPriority, TaskStatus } from '@/shared/transport/graphql';
import { EMPTY_GROUP_ID } from './constants';
import {
  DiaryDialogCreateParams,
  DiaryDialogPasteParams,
  DiaryEvent,
  DiaryEventMeta,
  EventTask,
  TaskUpdateData,
} from './types';

class DiaryEventDomain {
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
        id: undefined,
        priority: defaultValues?.priority ?? TaskDomain.defaultFields.priority,
        status: defaultValues?.status ?? TaskDomain.defaultFields.status,
      },
    };
  }

  static update(task: TaskUpdateData): DiaryEvent {
    return DiaryEventDomain.mapTaskToEvent(task);
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
      meta: DiaryEventDomain.getTaskMeta(event),
    };
  }

  static mapEventToTask(event: DiaryEvent): EventTask {
    const start = timeAndDate(temporalToDate(event.start));
    let end = timeAndDate(temporalToDate(event.end));

    if (event.allDay && end.valueOf() <= start.valueOf()) end = start.endOf('day');

    const meta = DiaryEventDomain.getTaskMeta(event);

    return {
      id: meta.id,
      name: event.title,
      description: event.description,
      status: meta.status,
      priority: meta.priority,
      settings: {
        isAllDay: event.allDay ?? false,
        icon: undefined,
      },
      groupId: DiaryEventDomain.mapCalendarIdToGroupId(event.calendarId),
      startDate: TaskDomain.dateToTaskStandard(start.toDate()),
      deadline: TaskDomain.dateToTaskStandard(end.toDate()),
    };
  }

  static mapTaskToEvent = (task: TaskUpdateData): DiaryEvent => {
    return {
      ...createEvent({
        id: this.createEventId(task.id),
        title: task.name,
        description: task.description ?? undefined,
        start: timeAndDate(task.startDate).toDate(),
        end: timeAndDate(task.deadline).toDate(),
        allDay: task?.settings?.isAllDay,
        calendarId: task.groupId?.toString() ?? EMPTY_GROUP_ID,
      }),
      meta: {
        id: task.id,
        priority: task.priority,
        status: task.status,
      },
    };
  };

  static withTaskMeta(event: DayflowEvent): DiaryEvent {
    return { ...event, meta: DiaryEventDomain.getTaskMeta(event) };
  }

  private static getTaskMeta(event: DayflowEvent): DiaryEventMeta {
    const id = event.meta?.id;
    const status = event.meta?.status;
    const priority = event.meta?.priority;

    return {
      ...event.meta,
      id: id != null && typeof id === 'string' ? (id as TaskId) : undefined,
      status: Object.values(TaskStatus).includes(status as TaskStatus)
        ? (status as TaskStatus)
        : TaskDomain.defaultFields.status,
      priority: Object.values(TaskPriority).includes(priority as TaskPriority)
        ? (priority as TaskPriority)
        : TaskDomain.defaultFields.priority,
    };
  }

  static createEventId = (taskId: DiaryTask<GroupId, TaskId>['id']): string => {
    return encodeURIComponent(taskId);
  };

  private static mapCalendarIdToGroupId(calendarId?: string): GroupId | undefined {
    if (calendarId == null || calendarId === EMPTY_GROUP_ID) return undefined;

    const groupId = Number(calendarId);
    return Number.isFinite(groupId) ? (groupId as GroupId) : undefined;
  }
}

export { DiaryEventDomain };
