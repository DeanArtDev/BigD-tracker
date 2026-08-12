import { CalendarRegistry, createEvent, type ICalendarApp, ViewType } from '@dayflow/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskType } from '@/entity/planner/tasks';
import { RecurrenceFrequency } from '@/shared/transport/graphql';
import { DiaryEventCard } from './diary-event-card';

const app = { getCalendarRegistry: () => new CalendarRegistry() } as ICalendarApp;

const coloredCalendarRegistry = new CalendarRegistry([
  {
    id: '8',
    name: 'Работа',
    colors: {
      eventColor: '#dbeafe',
      eventSelectedColor: '#2563eb',
      lineColor: '#3b82f6',
      textColor: '#1e3a8a',
    },
  },
]);
const coloredApp = { getCalendarRegistry: () => coloredCalendarRegistry } as ICalendarApp;

function getEvent(loading: boolean, recurring = false) {
  return {
    ...createEvent({
      id: 'event-id',
      title: 'Новое дело',
      start: new Date(2026, 7, 10, 7, 30),
      end: new Date(2026, 7, 10, 8, 30),
      allDay: true,
    }),
    meta: {
      loading,
      taskType: recurring ? TaskType.Virtual : TaskType.Original,
      recurrence: recurring
        ? {
            frequency: RecurrenceFrequency.Daily,
            startDate: '2026-08-10T07:30',
          }
        : null,
    },
  };
}

describe('DiaryEventCard', () => {
  it('renders the default all-day event content', () => {
    const { container } = render(
      <DiaryEventCard
        app={app}
        event={getEvent(false)}
        isAllDay
        isDragging={false}
        isMobile={false}
        isSelected={false}
        viewType={ViewType.DAY}
      />,
    );

    expect(container.querySelector('.df-event-content-row')).toBeInTheDocument();
    expect(container.querySelector('.df-event-title')).toHaveTextContent('Новое дело');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each([ViewType.DAY, ViewType.WEEK, ViewType.MONTH])('renders the recurrence icon in the %s view', (viewType) => {
    render(
      <DiaryEventCard
        app={app}
        event={getEvent(false, true)}
        isAllDay
        isDragging={false}
        isMobile={false}
        isSelected={false}
        viewType={viewType}
      />,
    );

    expect(screen.getByLabelText('Повторяющееся дело')).toBeInTheDocument();
  });

  it('renders the calendar icon only for all-day events', () => {
    const { container, rerender } = render(
      <DiaryEventCard
        app={app}
        event={getEvent(false)}
        isAllDay
        isDragging={false}
        isMobile={false}
        isSelected={false}
        viewType={ViewType.DAY}
      />,
    );

    expect(container.querySelector('.lucide-calendar')).toBeInTheDocument();

    rerender(
      <DiaryEventCard
        app={app}
        event={{ ...getEvent(false), allDay: false }}
        isAllDay={false}
        isDragging={false}
        isMobile={false}
        isSelected={false}
        viewType={ViewType.DAY}
      />,
    );

    expect(container.querySelector('.lucide-calendar')).not.toBeInTheDocument();
  });

  it('resolves the event background through the calendar registry', () => {
    const { container } = render(
      <div className="df-month-segment-event" style={{ background: '#ddd6fe' }}>
        <DiaryEventCard
          app={coloredApp}
          event={{ ...getEvent(false), calendarId: '8' }}
          isAllDay
          isDragging={false}
          isMobile={false}
          isSelected={false}
          viewType={ViewType.MONTH}
        />
      </div>,
    );

    expect(container.querySelector('.df-event-month-all-day')).not.toHaveAttribute('style');
    const segment = container.querySelector<HTMLElement>('.df-month-segment-event');
    expect(segment).toHaveAttribute('data-diary-calendar-color', 'true');
    expect(segment?.style.getPropertyValue('--diary-event-background')).toBe('#dbeafe');
    expect(segment?.style.getPropertyValue('--diary-event-color')).toBe('#1e3a8a');
    expect(segment?.style.getPropertyValue('--diary-event-selected-background')).toBe('#2563eb');
    expect(segment?.style.getPropertyValue('--diary-event-selected-color')).toBe('#fff');
  });

  it('blocks pointer actions while the event is loading', () => {
    const onMouseDown = vi.fn();
    const onDoubleClick = vi.fn();

    render(
      <div onDoubleClick={onDoubleClick} onMouseDown={onMouseDown}>
        <DiaryEventCard
          app={app}
          event={getEvent(true)}
          isAllDay
          isDragging={false}
          isMobile={false}
          isSelected={false}
          viewType={ViewType.DAY}
        />
      </div>,
    );

    const overlay = screen.getByRole('status', { name: 'Сохранение дела' });
    fireEvent.mouseDown(overlay);
    fireEvent.doubleClick(overlay);

    expect(onMouseDown).not.toHaveBeenCalled();
    expect(onDoubleClick).not.toHaveBeenCalled();
  });
});
