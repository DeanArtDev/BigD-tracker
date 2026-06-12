'use client';

import { type ComponentProps } from 'react';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { formElementsValues } from './form-schema-utils';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Select, SelectContent, SelectTrigger, SelectValue } from '../ui/select';

type SelectFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof SelectContent>,
  'name' | 'type'
> & {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly placeholder?: string;
  readonly isErrorMessage?: boolean;
  readonly classNames?: {
    readonly wrapper?: string;
    readonly label?: string;
    readonly trigger?: string;
  };
};

function SelectForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  children,
  placeholder,
  classNames,
  disabled = false,
  ...selectContentProps
}: SelectFormProps<FormValues>) {
  return (
    <Controller<FormValues>
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field className={classNames?.wrapper}>
            {label && <FieldLabel className={classNames?.label}>{label}</FieldLabel>}

            <Select
              {...field}
              disabled={disabled || field.disabled}
              value={field.value ?? formElementsValues.select.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger aria-invalid={Boolean(fieldState.error)} className={classNames?.trigger}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent position="popper" {...selectContentProps}>
                {children}
              </SelectContent>
            </Select>

            {isErrorMessage && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export { SelectForm, type SelectFormProps };
