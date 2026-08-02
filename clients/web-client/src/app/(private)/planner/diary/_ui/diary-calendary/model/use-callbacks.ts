import { CalendarCallbacks, CalendarType, Event, EventChange, UseCalendarAppReturn, ViewType } from '@dayflow/core';
import { useMemo } from 'react';
import { MaybePromise } from '@/shared/lib';
import { DiaryDialogActions, type DiaryEvent } from './diary-dialog-actions';

function withDiaryEvent(callback: (event: DiaryEvent) => MaybePromise<void>): (event: Event) => MaybePromise<void> {
  return (event) => callback(DiaryDialogActions.withTaskMeta(event));
}

function useCallbacks({ calendar }: { calendar: UseCalendarAppReturn | null }) {
  return useMemo<CalendarCallbacks>(
    () => ({
      onEventCreate: withDiaryEvent(async (event) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });
        console.log('create event:', event);
      }),
      onEventClick: (event: Event) => {
        console.log('click event:', event);
      },
      onEventDoubleClick: (event: Event) => {
        console.log('double click event:', event);
        // You could use the event element as an anchor for a custom popover here
        return true;
      },
      onEventUpdate: withDiaryEvent(async (event) => {
        console.log('update event:', event);
      }),
      onEventDelete: async (eventId: string) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('delete event:', eventId);
      },
      onMoreEventsClick: (date: Date) => {
        console.log('more events click date:', date);
        calendar?.selectDate(date);
        calendar?.changeView(ViewType.DAY);
      },
      onCalendarUpdate: async (cal: CalendarType) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('update calendar:', cal);
      },
      onCalendarDelete: async (calendarId: string) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('delete calendar:', calendarId);
      },
      onCalendarCreate: async (cal: CalendarType) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('create calendar: w', cal);
      },
      onCalendarMerge: async (sourceId: string, targetId: string) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('merge calendar:', sourceId, targetId);
      },
      onEventBatchChange: (event: EventChange[]) => {
        console.log('batch change events:', event);
      },
    }),
    [calendar],
  );
}

export { useCallbacks };
