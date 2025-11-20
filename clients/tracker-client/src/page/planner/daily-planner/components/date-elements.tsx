import type { ThingManagerFormData } from '@/entity/planner/things/ui';
import dayjs from '@/shared/lib/time';
import { Checkbox } from '@/shared/ui-kit/ui/checkbox';
import { Label } from '@/shared/ui-kit/ui/label';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormDateTimePickerComboBox } from './form-date-time-picker-combo-box';

interface DateElementsProps {
  readonly dateSet?: { from?: string; to?: string };
}

function DateElements({ dateSet }: DateElementsProps) {
  const context = useFormContext<ThingManagerFormData>();
  const [allDay, setAllDay] = useState(false);

  const resetDeadline = () => context.setValue('deadline', undefined, { shouldDirty: false });

  const startDate = useWatch<{ startDate: ThingManagerFormData['startDate'] }>({
    name: 'startDate',
  });
  const deadline = useWatch<{ deadline: ThingManagerFormData['deadline'] }>({ name: 'deadline' });

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormDateTimePickerComboBox
        name="startDate"
        allDay={allDay}
        title="Начать"
        selectedDate={dayjs(startDate)}
        defaultMonth={dayjs(dateSet?.from)}
        onTimeSlotChange={(timeSlotDate) => {
          context.setValue('startDate', timeSlotDate.toDate(), { shouldValidate: true });
          resetDeadline();
        }}
        onFormDateChange={() => {
          resetDeadline();
        }}
      />

      <FormDateTimePickerComboBox
        name="deadline"
        allDay={allDay}
        title="Завершить"
        selectedDate={dayjs(deadline)}
        defaultMonth={dayjs(dateSet?.to)}
        onTimeSlotChange={(timeSlotDate) => {
          context.setValue('deadline', timeSlotDate.toDate(), { shouldValidate: true });
        }}
      />

      <div className="flex gap-4 ml-auto col-start-2 col-span-1">
        <Checkbox
          id="all-day"
          checked={allDay}
          className="h-[20px] w-[20px]"
          onCheckedChange={(checked) => {
            if (checked === true) {
              context.setValue('startDate', dayjs(dateSet?.from).startOf('day').toDate());
              context.setValue('deadline', dayjs(dateSet?.to).endOf('day').toDate());
              setAllDay(true);
            } else {
              context.setValue('startDate', undefined, { shouldDirty: false });
              resetDeadline();
              setAllDay(false);
            }
          }}
        />
        <Label htmlFor="all-day">Весь текущий день</Label>
      </div>
    </div>
  );
}

export { DateElements, type DateElementsProps };
