import type { Dayjs } from 'dayjs';
import { upperFirst } from 'lodash-es';
import { useMemo } from 'react';
import { NavActions } from './nav-actions';
import { useSelectedDate } from '../model/selectors';

interface NavBarProps {
  readonly onDateChange?: (date: Dayjs) => void;
}

function NavBar({ onDateChange }: NavBarProps) {
  const selectedDate = useSelectedDate();

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

        <NavActions onDateChange={onDateChange} />
      </div>

      <div className="w-full h-[2px] bg-gray-400 rounded-md" />

      <div>
        <h4 className="text-xs">all-day</h4>
        {/* все таски что идут весь день */}
      </div>

      <div className="w-full h-[4px] bg-gray-400 rounded-md" />
    </div>
  );
}

export { NavBar };
