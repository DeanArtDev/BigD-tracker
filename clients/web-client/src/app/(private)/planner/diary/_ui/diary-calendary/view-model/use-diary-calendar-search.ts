import type { CalendarSearchProps } from '@dayflow/core';
import { type RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

const SEARCH_EVENT_SCROLL_ATTEMPTS = 30;

interface UseDiaryCalendarSearchParams {
  readonly containerRef: RefObject<HTMLDivElement | null>;
}

function useDiaryCalendarSearch({ containerRef }: UseDiaryCalendarSearchParams): CalendarSearchProps {
  const scrollFrameRef = useRef<number | null>(null);

  const onResultClick = useCallback<NonNullable<CalendarSearchProps['onResultClick']>>(
    ({ event, app, defaultAction }) => {
      if (scrollFrameRef.current != null) cancelAnimationFrame(scrollFrameRef.current);

      defaultAction();
      app.selectEvent(event.id);

      const scrollToEvent = (attempt: number) => {
        const eventElement = Array.from(
          containerRef.current?.querySelectorAll<HTMLElement>('[data-event-id]') ?? [],
        ).find((element) => element.dataset.eventId === event.id);

        if (eventElement != null) {
          scrollFrameRef.current = null;
          eventElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          return;
        }

        if (attempt >= SEARCH_EVENT_SCROLL_ATTEMPTS) {
          scrollFrameRef.current = null;
          return;
        }

        scrollFrameRef.current = requestAnimationFrame(() => scrollToEvent(attempt + 1));
      };

      scrollFrameRef.current = requestAnimationFrame(() => scrollToEvent(1));
    },
    [containerRef],
  );

  useEffect(
    () => () => {
      if (scrollFrameRef.current != null) cancelAnimationFrame(scrollFrameRef.current);
    },
    [],
  );

  return useMemo(() => ({ onResultClick }), [onResultClick]);
}

export { useDiaryCalendarSearch };
