'use client';

import {
  type EventContentSlotArgs,
  extractHourFromTemporal,
  formatEventTimeRange,
  formatTime,
  getEventBgColor,
  getEventEndHour,
  getEventTextColor,
  type ICalendarApp,
  getLineColor,
  getPrimaryCalendarId,
  getSelectedBgColor,
  ViewType,
} from '@dayflow/core';
import { CalendarIcon, Repeat } from 'lucide-react';
import { type CSSProperties, type PropsWithChildren, type SyntheticEvent, useLayoutEffect, useRef } from 'react';
import { DiaryEventDomain } from '@/app/(private)/planner/diary/_ui/diary-calendary/model';
import { TaskType } from '@/entity/planner/tasks';
import { cn, Spinner } from '@/shared/ui-kit';

interface DiaryEventCardProps extends EventContentSlotArgs {
  readonly app: ICalendarApp;
}

type DiaryEventCardContentProps = Pick<DiaryEventCardProps, 'app' | 'event' | 'isAllDay' | 'viewType'>;

interface EventCardColorStyle extends CSSProperties {
  readonly background: string;
  readonly color: string;
}

function stopEvent(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
}

function DiaryEventCard({ app, event, viewType }: DiaryEventCardProps) {
  const loading = event.meta?.loading === true;

  return (
    <>
      <DiaryEventCardContent app={app} event={event} isAllDay={event.allDay ?? false} viewType={viewType} />

      {loading && (
        <div
          aria-label="Сохранение дела"
          aria-live="polite"
          className={cn('diary-event-card-loading-overlay')}
          role="status"
          onClick={stopEvent}
          onContextMenu={stopEvent}
          onDoubleClick={stopEvent}
          onMouseDown={stopEvent}
          onPointerDown={stopEvent}
          onTouchStart={stopEvent}
        >
          <Spinner aria-hidden="true" className={cn('size-3')} />
        </div>
      )}
    </>
  );
}

function DiaryEventRecurrenceIcon({ className }: { className?: string }) {
  return <Repeat aria-label="Повторяющееся дело" className={cn('diary-event-card-recurrence-icon', className)} />;
}

function getEventCardColorStyle(
  app: ICalendarApp,
  event: DiaryEventCardProps['event'],
  isSelected: boolean,
): EventCardColorStyle {
  const registry = app.getCalendarRegistry();
  const primaryCalendarId = getPrimaryCalendarId(event);

  if (isSelected) {
    return {
      background: getSelectedBgColor(primaryCalendarId, registry),
      color: '#fff',
    };
  }

  return {
    background: getEventBgColor(primaryCalendarId, registry),
    color: getEventTextColor(primaryCalendarId, registry),
  };
}

interface DiaryMonthEventCardSurfaceProps extends PropsWithChildren {
  readonly className: string;
  readonly defaultColorStyle: EventCardColorStyle;
  readonly selectedColorStyle: EventCardColorStyle;
}

/* FIXME: баг самой либы, не прокидывается registry и не видит кастомные цвета календарей,
    видит только дефолтные, удалить workaround при исправлении разработчиками */
function DiaryMonthEventCardSurface({
  children,
  className,
  defaultColorStyle,
  selectedColorStyle,
}: DiaryMonthEventCardSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const segment = ref.current?.closest<HTMLElement>('.df-month-segment-event');
    if (segment == null) return;

    segment.dataset.diaryCalendarColor = 'true';
    segment.style.setProperty('--diary-event-background', defaultColorStyle.background);
    segment.style.setProperty('--diary-event-color', defaultColorStyle.color);
    segment.style.setProperty('--diary-event-selected-background', selectedColorStyle.background);
    segment.style.setProperty('--diary-event-selected-color', selectedColorStyle.color);
  }, [defaultColorStyle.background, defaultColorStyle.color, selectedColorStyle.background, selectedColorStyle.color]);

  return (
    <div ref={ref} className={cn('diary-month-event-card-surface', className)}>
      {children}
    </div>
  );
}

function DiaryEventCardContent({ app, event, isAllDay, viewType }: DiaryEventCardContentProps) {
  const isRecurring = [TaskType.Override, TaskType.Virtual].includes(DiaryEventDomain.getTaskMeta(event).taskType);
  const defaultColorStyle = getEventCardColorStyle(app, event, false);
  const selectedColorStyle = getEventCardColorStyle(app, event, true);
  const lineColor = getLineColor(getPrimaryCalendarId(event), app.getCalendarRegistry());

  if (viewType === ViewType.MONTH) {
    if (isAllDay) {
      return (
        <DiaryMonthEventCardSurface
          className={cn('df-event-month-all-day', isRecurring && 'diary-event-card-with-recurrence')}
          defaultColorStyle={defaultColorStyle}
          selectedColorStyle={selectedColorStyle}
        >
          <span className={cn('df-event-icon-slot')}>
            <CalendarIcon className={cn('df-event-icon-svg')} />
          </span>
          <span className={cn('df-event-month-title')}>{event.title}</span>
          {isRecurring && <DiaryEventRecurrenceIcon className="top-0.5!" />}
        </DiaryMonthEventCardSurface>
      );
    }

    const startHour = extractHourFromTemporal(event.start);

    return (
      <DiaryMonthEventCardSurface
        className={cn('df-event-month-regular', isRecurring && 'diary-event-card-with-recurrence')}
        defaultColorStyle={defaultColorStyle}
        selectedColorStyle={selectedColorStyle}
      >
        <div className={cn('df-event-month-main')}>
          <div className={cn('df-event-month-color-bar')} style={{ backgroundColor: lineColor }} />
          <span className={cn('df-event-month-title')}>{event.title}</span>
        </div>
        <span className={cn('df-event-month-time')}>
          {formatTime(Math.floor(startHour), Math.round((startHour % 1) * 60), '24h')}
        </span>
        {isRecurring && <DiaryEventRecurrenceIcon className="top-0.5!" />}
      </DiaryMonthEventCardSurface>
    );
  }

  if (isAllDay) {
    return (
      <div className={cn('df-event-content-row', isRecurring && 'diary-event-card-with-recurrence')}>
        <span className={cn('df-event-icon-slot')}>
          <CalendarIcon className={cn('df-event-icon-svg')} />
        </span>
        <div className={cn('df-event-title', 'df-event-title-tight')}>{event.title}</div>
        {isRecurring && <DiaryEventRecurrenceIcon />}
      </div>
    );
  }

  const duration = getEventEndHour(event) - extractHourFromTemporal(event.start);

  return (
    <>
      <div className={cn('df-event-color-bar')} style={{ backgroundColor: lineColor }} />
      <div
        className={cn('df-event-timed-content', isRecurring && 'diary-event-card-with-recurrence')}
        data-density={duration <= 0.25 ? 'compact' : 'default'}
      >
        <div className={cn('df-event-title', duration <= 0.25 && 'df-event-title-tight')}>{event.title}</div>
        {duration > 0.5 && <div className={cn('df-event-time')}>{formatEventTimeRange(event, '24h')}</div>}
        {isRecurring && <DiaryEventRecurrenceIcon />}
      </div>
    </>
  );
}

export { DiaryEventCard };
