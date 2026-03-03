import dayjs from '@/shared/lib/time';
import type { TimeEvent, TimeViewEvent } from '@/shared/lib/time-view/core';
import { isFunction } from 'lodash-es';
import { Clock } from 'lucide-react';
import { type JSX } from 'react';
import { useEventsState } from '../model/selectors';

interface EventListProps<TExtra = any> {
  readonly events: TimeViewEvent<TExtra>[];
  readonly renderEvent?: (props: { event: TimeEvent<TExtra> }) => JSX.Element;
  readonly onEventClick?: (event: TimeEvent<TExtra>) => void;
}

function EventList<TExtra = any>({ events, renderEvent, onEventClick }: EventListProps<TExtra>) {
  const { eventList } = useEventsState<TExtra>({ events });

  const isRenderPassed = isFunction(renderEvent);
  const RenderComponent = renderEvent!;

  return (
    <ul className="event-list flex flex-col absolute top-0 bottom-0 left-0 right-0">
      {eventList.map((event) => {
        return (
          <li
            key={event.key}
            className="absolute"
            style={{
              top: event.position.top,
              left: event.position.left,
              right: event.position.right,
              bottom: event.position.bottom,
              zIndex: event.style?.zIndex,
            }}
            onClick={() => void onEventClick?.(event)}
          >
            {isRenderPassed ? (
              <RenderComponent key={event.key} event={event} />
            ) : (
              <article className="flex flex-col h-full items-start w-full cursor-pointer px-2 py-0.5 md:py-0 min-h-[20px] bg-gray-200 rounded-sm border border-gray-400 shadow-sm overflow-hidden">
                <span className="w-full truncate text-xs md:text-sm font-medium break-words break-all">
                  {event.name}
                </span>

                <time className="flex gap-1 truncate text-gray-600 text-xs items-center break-words break-all">
                  <Clock size={12} />
                  {dayjs(event.to).format('HH:mm')}
                </time>
              </article>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { EventList };
