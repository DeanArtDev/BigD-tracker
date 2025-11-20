import dayjs from '@/shared/lib/time';
import type { TimeViewEvent } from '@/shared/lib/time-view/core';
import { useEventsState } from '../model/selectors';

function EventList<TExtra extends { id: number }>({ events }: { events: TimeViewEvent<TExtra>[] }) {
  const { eventList } = useEventsState<TExtra>({ events });

  return (
    <div className="event-list flex flex-col absolute top-0 bottom-0 left-0 right-0">
      {eventList.map((event) => {
        const range = `${dayjs(event.from).format('DD-MM HH:mm')} | ${dayjs(event.to).format('DD-MM HH:mm')}`;

        return (
          <article
            key={event.extra?.id}
            className="absolute cursor-pointer px-2 min-h-[20px] bg-gray-200 rounded-sm border border-gray-400 shadow-sm"
            style={{
              top: event.position.top,
              left: event.position.left,
              right: event.position.right,
              bottom: event.position.bottom,
              zIndex: event.style?.zIndex,
            }}
          >
            <div className="flex w-full items-start gap-4">
              <span className="flex items-center text-xs md:text-sm font-medium overflow-hidden truncate break-words break-all">
                {event.name}
              </span>
              <time className="text-xs md:text-sm overflow-hidden truncate break-words break-all">
                {range}
              </time>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export { EventList };
