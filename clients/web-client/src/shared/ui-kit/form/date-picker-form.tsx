import { CalendarIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Controller, type ControllerRenderProps, type FieldValues, type Path } from 'react-hook-form';
import timeAndDate from '@/shared/lib/time';
import { formElementsValues } from './form-schema-utils';
import { cn } from '../lib/utils';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type CalendarFormProps = Omit<ComponentProps<typeof Calendar>, 'className' | 'classNames' | 'onSelect' | 'disabled'>;

type DatePickerFormProps<FormValues extends FieldValues = FieldValues> = CalendarFormProps & {
  readonly name: Path<FormValues>;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly format?: string;
  readonly dateShift?: 'endDay' | 'startDay';
  readonly isErrorMessage?: boolean;
  readonly max?: Date;
  readonly min?: Date;
  readonly classNames?: {
    readonly label?: string;
    readonly wrapper?: string;
    readonly input?: string;
    readonly trigger?: string;
  };
  readonly renderInput?: (props: ControllerRenderProps<Record<string, Date>, string>) => ReactNode;
  readonly onBeforeValueChange?: (
    current: Date | typeof formElementsValues.datePicker.value,
    prev: Date | typeof formElementsValues.datePicker.value,
  ) => Date | typeof formElementsValues.datePicker.value;
};

function DatePickerForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  max,
  min,
  format = 'D MMM',
  dateShift = 'startDay',
  isErrorMessage = true,
  disabled = false,
  classNames,
  onBeforeValueChange = (date) => date,
  renderInput,
  ...props
}: DatePickerFormProps<FormValues>) {
  return (
    <Controller<Record<string, Date>>
      name={name}
      render={({ field, fieldState }) => {
        if (field.value != null && !timeAndDate(field.value).isValid()) {
          throw new Error('field.value must be Date type');
        }

        return (
          <Field className={classNames?.wrapper}>
            {label && <FieldLabel className={classNames?.label}>{label}</FieldLabel>}

            <Popover modal>
              <PopoverTrigger asChild>
                {renderInput != null ? (
                  renderInput(field)
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    aria-invalid={fieldState.invalid}
                    disabled={disabled || field.disabled}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className={cn(
                      'f-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground',
                      classNames?.trigger,
                    )}
                  >
                    {field.value ? timeAndDate(field.value).format(format) : <span>Выбор даты</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                )}
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  {...props}
                  mode="single"
                  className={classNames?.input}
                  disableNavigation={field.disabled}
                  defaultMonth={field.value}
                  selected={field.value}
                  disabled={(date) => date > new Date(max ?? '') || date < new Date(min ?? '')}
                  onSelect={(day) => {
                    if (day == null) {
                      field.onChange(onBeforeValueChange(formElementsValues.datePicker.value, field.value));
                    } else {
                      field.onChange(
                        onBeforeValueChange(
                          {
                            endDay: (date: Date) => timeAndDate(date).endOf('day').toDate(),
                            startDay: (date: Date) => timeAndDate(date).startOf('day').toDate(),
                          }[dateShift](day),
                          field.value,
                        ),
                      );
                    }
                  }}
                />
              </PopoverContent>
            </Popover>

            {isErrorMessage && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export { DatePickerForm, type DatePickerFormProps };
