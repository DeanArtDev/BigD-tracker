import timeAndDate from '@/shared/lib/time';
import { Typography } from '@/shared/ui-kit';
import { DatePickerForm, TimePickerForm } from '@/shared/ui-kit/form';

interface DateAndTimePickerProps {
  readonly name: 'startDate' | 'deadline';
  readonly max?: Date;
  readonly min?: Date;
}

function DateAndTimePicker({ name, min, max }: DateAndTimePickerProps) {
  const isStartDate = name === 'startDate';

  return (
    <div className="grid grid-cols-4 gap-2">
      <Typography.H6 className="font-medium col-span-4 items-center">
        {isStartDate ? 'Дата начала' : 'Дедлайн'}
      </Typography.H6>

      <DatePickerForm
        name={name}
        min={min}
        max={max}
        dateShift={isStartDate ? 'startDay' : 'endDay'}
        classNames={{ wrapper: 'col-span-3', trigger: 'bg-background hover:bg-background' }}
        isErrorMessage={false}
        onBeforeValueChange={(next, prev) => {
          if (next == null) return next;
          if (prev == null) return next;
          const prevDateObj = timeAndDate(prev).toObject();
          return timeAndDate(next).set('hour', prevDateObj.hours).set('minute', prevDateObj.minutes).toDate();
        }}
      />

      <TimePickerForm
        classNames={{ wrapper: 'col-span-1', inputGroup: 'bg-background' }}
        name={name}
        format="HH:mm"
        isErrorMessage={false}
      />
    </div>
  );
}

export { DateAndTimePicker, type DateAndTimePickerProps };
