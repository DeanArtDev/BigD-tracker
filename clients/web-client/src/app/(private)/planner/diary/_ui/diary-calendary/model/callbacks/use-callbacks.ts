import { CalendarCallbacks, Event, ViewType } from '@dayflow/core';
import { useEffect, useMemo } from 'react';
import { useDiaryContext, useDiaryDialogContext } from '../../context';
import { DiaryDialogActions } from '../diary-dialog-actions';
import { DiaryEvent } from '../types';
import { useEventDelete } from './use-event-delete';

function withDiaryEvent<TArgs extends unknown[], TResult>(
  callback: (event: DiaryEvent, ...args: TArgs) => TResult,
): (event: Event, ...args: TArgs) => TResult {
  return (event, ...args) => callback(DiaryDialogActions.withTaskMeta(event), ...args);
}

function useCallbacks() {
  const { calendar } = useDiaryContext();
  const { openDiaryDialog } = useDiaryDialogContext();
  const deleteEvent = useEventDelete();

  const app = calendar?.app;

  const callbacks = useMemo<CalendarCallbacks>(
    () => ({
      onEventDoubleClick: withDiaryEvent((event) => {
        openDiaryDialog(event);
        return false;
      }),
      onEventDelete: deleteEvent,
      onMoreEventsClick: (date: Date) => {
        app.selectDate(date);
        app.changeView(ViewType.DAY);
      },
    }),
    [app, deleteEvent, openDiaryDialog],
  );

  useEffect(() => {
    app.updateConfig({ callbacks });
  }, [app, callbacks]);
}

export { useCallbacks };
