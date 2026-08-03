import type { Event, UseCalendarAppReturn } from '@dayflow/core';
import { type RefObject, useEffect, useRef } from 'react';

interface UseYearWorkaroundParams {
  readonly calendar: UseCalendarAppReturn;
  readonly containerRef: RefObject<HTMLElement | null>;
}

function useYearWorkaround({ calendar, containerRef }: UseYearWorkaroundParams) {
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const app = calendar.app;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getYearEvent = (mouseEvent: MouseEvent): Event | undefined => {
      const target = mouseEvent.target;
      if (!(target instanceof Element)) return;

      const eventElement = target.closest<HTMLElement>('.df-year-event-bar[data-event-id]');
      if (!eventElement || !container.contains(eventElement)) return;

      return app.getEvents().find(({ id }) => id === eventElement.dataset.eventId);
    };

    const clearPendingClick = () => {
      if (clickTimeoutRef.current == null) return;

      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    };

    const handleClick = (mouseEvent: MouseEvent) => {
      const event = getYearEvent(mouseEvent);
      if (!event) return;

      clearPendingClick();
      clickTimeoutRef.current = setTimeout(() => {
        app.onEventClick(event);
        clickTimeoutRef.current = null;
      }, 180);
    };

    const handleDoubleClick = (mouseEvent: MouseEvent) => {
      const event = getYearEvent(mouseEvent);
      if (!event) return;

      clearPendingClick();
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      void app.onEventDoubleClick(event, mouseEvent);
    };

    container.addEventListener('click', handleClick, true);
    container.addEventListener('dblclick', handleDoubleClick, true);

    return () => {
      clearPendingClick();
      container.removeEventListener('click', handleClick, true);
      container.removeEventListener('dblclick', handleDoubleClick, true);
    };
  }, [app, containerRef]);
}

export { useYearWorkaround };
