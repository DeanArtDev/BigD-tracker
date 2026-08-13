'use client';

import { timeAndDate } from '@big-d/time';
import { useEffect, useRef } from 'react';
import { getMinutes } from './date-and-time-picker.lib';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

interface TimeSelectorProps {
  readonly disabled: boolean;
  readonly minuteStep: number;
  readonly onHourChange: (hour: number) => void;
  readonly onMinuteChange: (minute: number) => void;
  readonly value: Date;
}

function TimeSelector({ disabled, minuteStep, onHourChange, onMinuteChange, value }: TimeSelectorProps) {
  const current = timeAndDate(value);
  const currentHour = current.hour();
  const currentMinute = current.minute();
  const activeHourRef = useRef<HTMLButtonElement>(null);
  const activeMinuteRef = useRef<HTMLButtonElement>(null);
  const minutes = getMinutes(minuteStep, currentMinute);

  useEffect(() => {
    activeHourRef.current?.scrollIntoView({ block: 'center' });
    activeMinuteRef.current?.scrollIntoView({ block: 'center' });
  }, [currentHour, currentMinute]);

  return (
    <div className="flex min-h-0 min-w-30 flex-col border-t sm:border-t-0 sm:border-l">
      <div className="flex h-10 items-center justify-center border-b font-medium tabular-nums">
        {current.format('HH:mm')}
      </div>

      <div className="grid h-62 min-h-0 grid-cols-2 divide-x overflow-hidden">
        <div
          role="listbox"
          aria-label="Часы"
          className="no-scrollbar min-h-0 max-h-full touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-contain p-1"
        >
          {HOURS.map((hour) => {
            const selected = hour === currentHour;

            return (
              <button
                key={hour}
                ref={selected ? activeHourRef : undefined}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                className="flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums hover:bg-accent aria-selected:bg-primary aria-selected:text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onHourChange(hour)}
              >
                {String(hour).padStart(2, '0')}
              </button>
            );
          })}
        </div>

        <div
          role="listbox"
          aria-label="Минуты"
          className="no-scrollbar min-h-0 max-h-full touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-contain p-1"
        >
          {minutes.map((minute) => {
            const selected = minute === currentMinute;

            return (
              <button
                key={minute}
                ref={selected ? activeMinuteRef : undefined}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                className="flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums hover:bg-accent aria-selected:bg-primary aria-selected:text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onMinuteChange(minute)}
              >
                {String(minute).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { TimeSelector };
