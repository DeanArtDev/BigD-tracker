'use client';

import { ru } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import timeAndDate from '@/shared/lib/time';
import { Button, Calendar, cn, Popover, PopoverAnchor, PopoverContent, ResetButton, Typography } from '@/shared/ui-kit';
import { getDefaultValue, replaceDate } from './date-and-time-picker.lib';
import type { DateAndTimePickerProps } from './date-and-time-picker.types';
import { TimeSelector } from './time-selector';

function DateAndTimePicker({
  className,
  clearable = false,
  defaultTime,
  disabled = false,
  hideTimeSelector = false,
  label,
  locale = ru,
  max,
  min,
  minuteStep = 5,
  invalid,
  onChange,
  popoverProps,
  value,
}: DateAndTimePickerProps) {
  const getDraftValue = () => {
    const nextValue = getDefaultValue(value, defaultTime);

    return hideTimeSelector ? timeAndDate(nextValue).startOf('day').toDate() : nextValue;
  };

  const [draft, setDraft] = useState(getDraftValue);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => timeAndDate(getDraftValue()).startOf('month').toDate());
  const normalizedMinuteStep = Math.max(1, Math.min(60, Math.trunc(minuteStep)));

  const openPicker = () => {
    if (disabled) return;

    const nextValue = getDraftValue();
    setDraft(nextValue);
    setVisibleMonth(timeAndDate(nextValue).startOf('month').toDate());
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDraft(getDraftValue());
    }
    setOpen(nextOpen);
  };

  const selectTime = (unit: 'hour' | 'minute', nextValue: number) => {
    const nextDate = timeAndDate(draft).set(unit, nextValue).set('second', 0).set('millisecond', 0).toDate();
    setDraft(nextDate);
  };

  const selectDate = (date: Date) => {
    const nextDate = hideTimeSelector ? timeAndDate(date).startOf('day').toDate() : replaceDate(draft, date);
    setDraft(nextDate);
  };

  const commit = () => {
    onChange(hideTimeSelector ? timeAndDate(draft).startOf('day').toDate() : draft);
    setOpen(false);
  };

  const clear = () => {
    if (!clearable) return;

    onChange(undefined);
    setOpen(false);
  };

  return (
    <Popover {...popoverProps} open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div className={cn('grid grid-cols-2 gap-2 relative', className)}>
          {label != null && <Typography.H6 className="col-span-4 items-center font-medium">{label}</Typography.H6>}

          <Button
            type="button"
            variant="outline"
            aria-invalid={invalid}
            disabled={disabled}
            className="col-span-3 justify-start bg-background px-3 font-normal hover:bg-background"
            onClick={openPicker}
          >
            <CalendarDays className="text-muted-foreground" />
            <span className={cn('truncate', value == null && 'text-muted-foreground')}>
              {value == null
                ? 'Выбрать дату'
                : new Intl.DateTimeFormat(locale.code, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    ...(!hideTimeSelector && {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    }),
                  }).format(value)}
            </span>
          </Button>

          <ResetButton
            disabled={disabled}
            show={value != null && clearable}
            className="absolute -top-2.5 -right-2.5"
            onReset={() => {
              onChange(undefined);
              setOpen(false);
            }}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1rem)] gap-0 overflow-hidden p-0">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            required={!clearable}
            locale={locale}
            month={visibleMonth}
            selected={draft}
            disabled={(date) =>
              disabled ||
              (min != null && timeAndDate(date).startOf('day').isBefore(timeAndDate(min).startOf('day'))) ||
              (max != null && timeAndDate(date).startOf('day').isAfter(timeAndDate(max).startOf('day')))
            }
            onMonthChange={setVisibleMonth}
            onDayClick={selectDate}
          />

          {!hideTimeSelector && (
            <TimeSelector
              disabled={disabled}
              minuteStep={normalizedMinuteStep}
              value={draft}
              onHourChange={(hour) => selectTime('hour', hour)}
              onMinuteChange={(minute) => selectTime('minute', minute)}
            />
          )}
        </div>

        <div className={cn('flex border-t p-2', clearable ? 'justify-between' : 'justify-end')}>
          {clearable && (
            <Button type="button" size="sm" variant="ghost" disabled={disabled || value == null} onClick={clear}>
              Очистить
            </Button>
          )}

          <Button type="button" size="sm" disabled={disabled} onClick={commit}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DateAndTimePicker };
