import { DatePickerForm, TimeForm } from '@/shared/components/form';
import dayjs, { type Dayjs } from '@/shared/lib/time';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import type { FieldPath, FieldValues } from 'react-hook-form';

const timeSlots = new Array(24 * 4).fill(0).map((_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');

  return {
    hours,
    minutes,
    view: `${hoursStr}:${minutesStr}`,
  };
});

interface FormDateTimePickerComboBoxProps<FormValues extends FieldValues = FieldValues> {
  readonly name: FieldPath<FormValues>;
  readonly title?: string;
  readonly allDay?: boolean;
  readonly selectedDate?: Dayjs;
  readonly defaultMonth?: Dayjs;
  readonly onTimeSlotChange: (date: Dayjs) => void;
  readonly onFormDateChange?: () => void;
}

function FormDateTimePickerComboBox<FormValues extends FieldValues = FieldValues>(
  props: FormDateTimePickerComboBoxProps<FormValues>,
) {
  const { name, title, selectedDate, defaultMonth, allDay, onTimeSlotChange, onFormDateChange } =
    props;

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-base font-semibold">{title}</h4>

      <div className="flex flex-col max-h-[175px] h-full gap-4">
        <ul className={cn('grid gap-2 overflow-y-auto', { 'overflow-hidden': allDay })}>
          {timeSlots.map((timeSlot) => {
            const time = dayjs(selectedDate).set('h', timeSlot.hours).set('m', timeSlot.minutes);
            const isSelected = dayjs(selectedDate).isSame(time) && !allDay;

            return (
              <li key={`${timeSlot.hours} + ${timeSlot.minutes}`}>
                <Button
                  type="button"
                  disabled={allDay}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => {
                    onTimeSlotChange(time);
                  }}
                  className="w-full shadow-none"
                >
                  {timeSlot.view}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-4 flex-wrap justify-end">
        <DatePickerForm<FormValues>
          name={name}
          disabled={allDay}
          defaultMonth={defaultMonth?.toDate()}
          classNames={{ wrapper: 'grow' }}
          onChange={onFormDateChange}
        />

        {!allDay && (
          <TimeForm<FormValues> name={name} format="HH:mm" step="60" isErrorMessage={false} />
        )}
      </div>
    </div>
  );
}

export { FormDateTimePickerComboBox, type FormDateTimePickerComboBoxProps };
