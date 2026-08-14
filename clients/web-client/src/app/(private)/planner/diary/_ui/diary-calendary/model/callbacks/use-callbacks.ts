import { CalendarCallbacks, Event, ViewType } from '@dayflow/core';
import { useEffect, useMemo } from 'react';
import { useDiaryContext, useDiaryDialogContext } from '../../context';
import { DiaryEventDomain } from '../diary-event-domain';
import { DiaryEvent } from '../types';
import { useCalendarUpdate } from './use-calendar-update';
import { useEventDelete } from './use-event-delete';

function withDiaryEvent<TArgs extends unknown[], TResult>(
  callback: (event: DiaryEvent, ...args: TArgs) => TResult,
): (event: Event, ...args: TArgs) => TResult {
  return (event, ...args) => callback(DiaryEventDomain.withTaskMeta(event), ...args);
}

function useCallbacks() {
  const { app } = useDiaryContext();
  const { openDiaryDialog } = useDiaryDialogContext();
  const updateCalendar = useCalendarUpdate();
  const deleteEvent = useEventDelete();

  const callbacks = useMemo<CalendarCallbacks>(
    () => ({
      onEventDoubleClick: withDiaryEvent((event) => {
        if (event.meta.loading) return false;
        openDiaryDialog(event);
        return false;
      }),
      onEventDelete: deleteEvent,
      onCalendarUpdate: updateCalendar,
      onMoreEventsClick: (date: Date) => {
        app.selectDate(date);
        app.changeView(ViewType.DAY);
      },
    }),
    [app, deleteEvent, openDiaryDialog, updateCalendar],
  );

  useEffect(() => {
    app.updateConfig({ callbacks });
  }, [app, callbacks]);
}

export { useCallbacks };
