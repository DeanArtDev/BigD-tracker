'use client';

import type { FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import timeAndDate from '@/shared/lib/time';
import { DateAndTimePicker, type DateAndTimePickerProps } from '@/shared/project-ui';
import { formElementsValues } from '@/shared/ui-kit/form/form-schema-utils';
import { Field, FieldError, FieldLabel } from '../ui/field';

type DatePickerFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  DateAndTimePickerProps,
  'className' | 'label' | 'onChange' | 'value'
> & {
  readonly name: Path<FormValues>;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly classNames?: {
    readonly label?: string;
    readonly picker?: string;
    readonly wrapper?: string;
  };
  readonly onBeforeValueChange?: (current: Date | null, previous?: Date) => Date | null;
};

function DatePickerForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  disabled = false,
  isErrorMessage = true,
  classNames,
  onBeforeValueChange = (date) => date,
  popoverProps,
  ...pickerProps
}: DatePickerFormProps<FormValues>) {
  return (
    <Controller<Record<string, Date | undefined>>
      name={name}
      render={({ field, fieldState }) => {
        if (field.value != null && !timeAndDate(field.value).isValid()) {
          throw new Error('field.value must be Date type');
        }

        return (
          <Field className={classNames?.wrapper}>
            {label != null && <FieldLabel className={classNames?.label}>{label}</FieldLabel>}

            <DateAndTimePicker
              {...pickerProps}
              invalid={fieldState.invalid}
              className={classNames?.picker}
              disabled={disabled || field.disabled}
              popoverProps={popoverProps}
              value={field.value ?? formElementsValues.datePicker.value}
              onChange={(nextValue) =>
                field.onChange(
                  onBeforeValueChange(nextValue ?? formElementsValues.datePicker.changeResult, field.value),
                )
              }
            />

            {isErrorMessage && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export { DatePickerForm, type DatePickerFormProps };
