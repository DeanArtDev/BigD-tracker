import { isDate } from 'lodash-es';
import { Clock2Icon } from 'lucide-react';
import { type ComponentProps } from 'react';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import timeAndDate from '@/shared/lib/time';
import { cn } from '../lib/utils';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';

interface TimePickerFormProps<FormValues extends FieldValues = FieldValues> extends Omit<
  ComponentProps<'input'>,
  'className'
> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly format?: string;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly classNames?: {
    readonly label?: string;
    readonly wrapper?: string;
    readonly input?: string;
    readonly inputGroup?: string;
  };
}

function TimePickerForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  format,
  isErrorMessage = true,
  classNames,
  ...inputProps
}: TimePickerFormProps<FormValues>) {
  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => {
        if (field.value != null && !isDate(field.value)) {
          throw new Error('field.value must be valid Date type');
        }

        return (
          <Field className={classNames?.wrapper}>
            {label && <FieldLabel className={classNames?.label}>{label}</FieldLabel>}

            <InputGroup className={classNames?.inputGroup}>
              <InputGroupInput
                type="time"
                {...field}
                aria-invalid={fieldState.invalid}
                value={normalize(field.value, format)}
                placeholder="--/--"
                className={cn(
                  'h-full min-h-7 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                  classNames?.input,
                )}
                {...inputProps}
                onChange={(evt) => {
                  evt.stopPropagation();
                  evt.preventDefault();

                  const value = evt.target.value.trim();
                  if (value === '') return;
                  const [hours = '0', minutes = '0', seconds = '0'] = value.split(':');

                  const newDate = timeAndDate(field.value)
                    .set('h', parseInt(hours, 10))
                    .set('m', parseInt(minutes, 10))
                    .set('s', parseInt(seconds, 10))
                    .toDate();

                  field.onChange(newDate);
                }}
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>

            {isErrorMessage && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

function normalize(date?: Date, format = 'HH:mm:ss') {
  return date == null ? '' : timeAndDate(date).format(format);
}

export { TimePickerForm, type TimePickerFormProps };
