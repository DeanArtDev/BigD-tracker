import { type Event as DayflowEvent, ViewType } from '@dayflow/core';
import { GroupId } from '@/entity/planner/groups';
import { Task } from '@/entity/planner/tasks';
import { Override } from '@/shared/lib';
import { TaskPriority, TaskStatus } from '@/shared/transport/graphql';

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

type DiaryEventMeta = Pick<Task<GroupId>, 'priority' | 'status'> & { id?: Task<GroupId>['id'] } & Record<
    string,
    unknown
  >;

type DiaryEvent = Override<DayflowEvent, { meta: DiaryEventMeta }>;

type EventTask = Override<Task<GroupId>, { id?: Task<GroupId>['id'] }>;

export type {
  EventTask,
  DiaryEventMeta,
  DiaryEvent,
  DayflowEvent,
  TaskUpdateData,
  DiaryDialogPasteParams,
  DiaryDialogCreateParams,
  DiaryDialogDefaultValues,
};
