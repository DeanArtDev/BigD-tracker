import type { TimeViewEvent } from '@/shared/lib/time-view/core';
import { cn } from '@/shared/ui-kit/utils';
import { upperFirst } from 'lodash-es';
import { useMemo } from 'react';
import { useEventsState, useSelectedDateState } from '../model/selectors';
import { NavActions } from './nav-actions';

function NavBar<TExtra extends { id: number }>({ events }: { events: TimeViewEvent<TExtra>[] }) {
  const { selectedDate } = useSelectedDateState();
  const { allDayEvents } = useEventsState({ events });

  const date = useMemo(() => {
    return `${selectedDate.format('DD')} ${upperFirst(selectedDate.format('MMMM'))} ${selectedDate.format('YYYY')}`;
  }, [selectedDate]);

  return (
    <div className="time-view__header flex flex-col">
      <div className="flex w-full justify-between">
        <div className="flex flex-col">
          <data className="text-lg md:text-3xl font-bold mb-1 md:mb-2">{date}</data>

          <data className="text-base md:text-2xl mb-1">
            {upperFirst(selectedDate.format('dddd'))}
          </data>
        </div>

        <NavActions />
      </div>

      <div className="w-full h-[2px] bg-gray-400 rounded-md" />

      <div className="grid grid-cols-[60px_1fr] my-1">
        <h4 className="text-xs pl-2">all-day</h4>

        <ul className="flex flex-col gap-1">
          {allDayEvents.map((event) => {
            return (
              <article
                key={event.extra?.id}
                className={cn(
                  'grid px-2 overflow-hidden',
                  'cursor-pointer',
                  'bg-gray-200 rounded-sm border border-gray-400 shadow-sm',
                )}
              >
                <span className="text-xs grow md:text-sm font-medium max-h-[20px] break-words break-all">
                  {event.name}
                </span>
              </article>
            );
          })}
        </ul>
      </div>

      <div className="w-full h-[4px] bg-gray-400 rounded-md" />
    </div>
  );
}

export { NavBar };
