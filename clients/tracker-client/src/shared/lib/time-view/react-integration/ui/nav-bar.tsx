import type { TimeEvent, TimeViewEvent } from '@/shared/lib/time-view/core';
import { ScrollAreaNativeVertical } from '@/shared/ui-kit/ui/scroll-area-native-vertical';
import { cn } from '@/shared/ui-kit/utils';
import { isFunction, upperFirst } from 'lodash-es';
import { type JSX, useMemo } from 'react';
import { useEventsState, useSelectedDateState } from '../model/selectors';
import { NavActions } from './nav-actions';

interface NavBarProps<TExtra = any> {
  readonly events: TimeViewEvent<TExtra>[];
  readonly renderEvent?: (props: { event: TimeEvent<TExtra> }) => JSX.Element;
  readonly onEventClick?: (event: TimeEvent<TExtra>) => void;
}

function NavBar<TExtra = any>({ events, renderEvent, onEventClick }: NavBarProps<TExtra>) {
  const { selectedDate } = useSelectedDateState();
  const { allDayEvents } = useEventsState<TExtra>({ events });

  const date = useMemo(() => {
    return `${selectedDate.format('DD')} ${upperFirst(selectedDate.format('MMMM'))} ${selectedDate.format('YYYY')}`;
  }, [selectedDate]);

  return (
    <div className="time-view__header flex flex-col">
      <div className="flex w-full justify-between">
        <div className="flex flex-col">
          <data className="text-lg md:text-3xl font-bold mb-1 md:mb-2">{date}</data>

          <data className="text-base md:text-2xl mb-1">{upperFirst(selectedDate.format('dddd'))}</data>
        </div>

        <NavActions />
      </div>

      <div className="w-full h-[2px] bg-gray-400 rounded-md" />

      <div className="grid grid-cols-[60px_1fr] my-1">
        <h4 className="text-xs pl-2 min-h-0">all-day</h4>

        <ScrollAreaNativeVertical className="min-h-0 max-h-[100px] sm:max-h-[190px]">
          <ul className="flex flex-col min-h-0 grow gap-1">
            {allDayEvents.map((event) => {
              if (isFunction(renderEvent)) {
                const Component = renderEvent;
                return <Component key={event.key} event={event} />;
              }

              return (
                <article
                  key={event.key}
                  className={cn(
                    'grid px-2 overflow-hidden',
                    'cursor-pointer',
                    'bg-gray-200 rounded-sm border border-gray-400 shadow-sm',
                  )}
                >
                  <li
                    className="text-xs grow md:text-sm font-medium max-h-[20px] wrap-break-word break-all"
                    onClick={() => void onEventClick?.(event)}
                  >
                    {event.name}
                  </li>
                </article>
              );
            })}
          </ul>
        </ScrollAreaNativeVertical>
      </div>

      <div className="w-full h-[4px] bg-gray-400 rounded-md" />
    </div>
  );
}

export { NavBar };
