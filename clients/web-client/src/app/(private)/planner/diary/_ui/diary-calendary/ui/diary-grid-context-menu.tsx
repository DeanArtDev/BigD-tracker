'use client';

import {
  clipboardStore,
  dateToPlainDate,
  dateToZonedDateTime,
  generateUniKey,
  temporalToDate,
  type GridContextMenuSlotArgs,
  type ICalendarApp,
  ViewType,
} from '@dayflow/core';
import { CalendarPlus, ClipboardPaste } from 'lucide-react';
import timeAndDate from '@/shared/lib/time';
import { Button } from '@/shared/ui-kit';
import { useDiaryContext } from '../context';

interface GridContextMenuState {
  readonly date: Date;
  readonly viewType?: ViewType;
}

function createCalendarEvent(app: ICalendarApp, state: GridContextMenuState) {
  const calendar = app.getCalendarRegistry().getDefaultWritableCalendar();
  if (!calendar) return;

  const start = timeAndDate(state.date);
  const isAllDay = state.viewType === ViewType.MONTH || state.viewType === ViewType.YEAR;
  const end = isAllDay ? start.startOf('day') : start.add(1, 'hour');

  const event = {
    id: generateUniKey(),
    title: 'Новое событие',
    start: isAllDay ? dateToPlainDate(start.toDate()) : dateToZonedDateTime(start.toDate(), app.timeZone),
    end: isAllDay ? dateToPlainDate(end.toDate()) : dateToZonedDateTime(end.toDate(), app.timeZone),
    allDay: isAllDay,
    calendarId: calendar.id,
  };

  app.addEvent(event);
  app.selectEvent(event.id);
  app.onEventDetailToggle(event.id);
}

function pasteCalendarEvent(app: ICalendarApp, date: Date, viewType?: ViewType) {
  const copiedEvent = clipboardStore.getEvent();
  if (!copiedEvent) return;

  const copiedStart = timeAndDate(temporalToDate(copiedEvent.start));
  const copiedEnd = timeAndDate(temporalToDate(copiedEvent.end));
  const duration = copiedEnd.diff(copiedStart, 'millisecond');
  let start = timeAndDate(date);
  const isDateOnlyView = viewType === ViewType.MONTH || viewType === ViewType.YEAR;
  const isMidnight = start.hour() === 0 && start.minute() === 0;
  const copiedEventHasTime = copiedStart.hour() !== 0 || copiedStart.minute() !== 0;

  if (!copiedEvent.allDay && (isDateOnlyView || (isMidnight && copiedEventHasTime))) {
    start = start
      .set('hour', copiedStart.hour())
      .set('minute', copiedStart.minute())
      .set('second', copiedStart.second())
      .set('millisecond', copiedStart.millisecond());
  }

  const end = duration > 0 ? start.add(duration, 'millisecond') : start.add(1, 'hour');
  const calendarId =
    copiedEvent.calendarId && app.getCalendarRegistry().has(copiedEvent.calendarId)
      ? copiedEvent.calendarId
      : app.getCalendarRegistry().getDefaultCalendarId() || 'default';

  app.addEvent({
    ...copiedEvent,
    id: generateUniKey(),
    start: copiedEvent.allDay ? dateToPlainDate(start.toDate()) : dateToZonedDateTime(start.toDate(), app.timeZone),
    end: copiedEvent.allDay ? dateToPlainDate(end.toDate()) : dateToZonedDateTime(end.toDate(), app.timeZone),
    calendarId,
  });
}

function DiaryGridContextMenu({ date, viewType, onClose }: GridContextMenuSlotArgs) {
  const { calendar } = useDiaryContext();
  const app = calendar.app;
  const itemClassName = 'w-full justify-start px-1 font-normal';

  const createEvent = () => {
    createCalendarEvent(app, { date, viewType });
    onClose();
  };

  const pasteEvent = () => {
    pasteCalendarEvent(app, date, viewType);
    onClose();
  };

  return (
    <div
      role="menu"
      aria-label="Действия с календарём"
      className="flex flex-col diary-grid-context-menu rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      <Button
        className={itemClassName}
        type="button"
        variant="ghost"
        size="default"
        role="menuitem"
        onClick={createEvent}
      >
        <CalendarPlus />
        Новое событие
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="default"
        role="menuitem"
        className={itemClassName}
        disabled={!clipboardStore.hasEvent()}
        onClick={pasteEvent}
      >
        <ClipboardPaste />
        Вставить сюда
      </Button>
    </div>
  );
}

export { DiaryGridContextMenu };
