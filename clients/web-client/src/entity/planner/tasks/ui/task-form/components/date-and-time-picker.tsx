import { Typography } from '@/shared/ui-kit';
import { DatePickerForm } from '@/shared/ui-kit/form';

interface DateAndTimePickerProps {
  readonly name: 'startDate' | 'deadline';
  readonly max?: Date;
  readonly min?: Date;
  readonly disabled?: boolean;
  readonly clearable?: boolean;
}

function DateAndTimePicker({ name, disabled, clearable = true, min, max }: DateAndTimePickerProps) {
  const isStartDate = name === 'startDate';

  return (
    <div className="grid grid-cols-4 gap-2">
      <Typography.H6 className="font-medium col-span-4 items-center">
        {isStartDate ? 'Дата начала' : 'Дедлайн'}
      </Typography.H6>

      <DatePickerForm
        disabled={disabled}
        name={name}
        min={min}
        max={max}
        clearable={clearable}
        popoverProps={{ modal: true }}
        classNames={{ wrapper: 'col-span-4' }}
        isErrorMessage={false}
      />
    </div>
  );
}

export { DateAndTimePicker, type DateAndTimePickerProps };
