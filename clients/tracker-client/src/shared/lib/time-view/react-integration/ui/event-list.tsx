import { useContainerSizeObserver } from '@/shared/ui-kit/helpers';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useEvents } from '../model/selectors';
import { useTimeViewController } from '../model';

function EventList<TExtra>() {
  const controller = useTimeViewController<TExtra>();
  const events = useEvents();

  const { ref, height = 0, width = 0 } = useContainerSizeObserver<HTMLDivElement>();

  const eventViewList = useMemo(() => {
    return controller.getEventViews({ height, width });
  }, [controller, height, width, events]);

  return (
    <div className="flex flex-col absolute top-0 bottom-0 left-0 right-0" ref={ref}>
      {eventViewList.map((event, index) => {
        const range = `${dayjs(event.from).format('HH:mm')} - ${dayjs(event.to).format('HH:mm')}`;

        return (
          <div
            // TODO: FIXME: опасно, добавить uuid
            key={JSON.stringify(event.extra ?? index)}
            className="absolute flex gap-4 items-top p-2 bg-gray-200 rounded-md border border-gray-400 w-fit shadow-md"
            style={{
              top: event.position.y,
              left: event.position.x,
              width: event.style.width,
              height: event.style.height,
              zIndex: event.style.zIndex,
            }}
          >
            <span className="text-xs md:text-base font-bold break-words break-all">
              {event.name}
            </span>
            <span className="hidden text-xs mt-1">{range}</span>
          </div>
        );
      })}
    </div>
  );
}

export { EventList };
