import dayjs from '@/shared/lib/time';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { Input } from '@/shared/ui-kit/ui/input';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { cn } from '@/shared/ui-kit/utils';
import { isDate } from 'lodash-es';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';

interface TimeFormProps<
  FormValues extends FieldValues = FieldValues,
> extends ComponentProps<'input'> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly format?: string;
  readonly label?: string;
  readonly inputClassName?: string;
  readonly isErrorMessage?: boolean;
}

function TimeForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  format,
  isErrorMessage = true,
  required = false,
  className,
  inputClassName,
  ...inputProps
}: TimeFormProps<FormValues>) {
  return (
    <FormField
      name={name}
      render={({ field }) => {
        if (field.value != null && !isDate(field.value)) {
          throw new Error('field.value must be valid Date type');
        }

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <Input
                type="time"
                value={normalize(field.value, format)}
                placeholder="--/--"
                className={cn(
                  'className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"',
                  inputClassName,
                )}
                {...inputProps}
                onChange={(evt) => {
                  const value = evt.target.value.trim();
                  const [hours = '0', minutes = '0', seconds = '0'] = value.split(':');

                  const newDate = dayjs(field.value)
                    .set('h', parseInt(hours, 10))
                    .set('m', parseInt(minutes, 10))
                    .set('s', parseInt(seconds, 10))
                    .toDate();

                  field.onChange(value === '' ? null : newDate);
                }}
              />
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

function normalize(date?: Date, format = 'HH:mm:ss') {
  return date == null ? '' : dayjs(date).format(format);
}

export { TimeForm, type TimeFormProps };
