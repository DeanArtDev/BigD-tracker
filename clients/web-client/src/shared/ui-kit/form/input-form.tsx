'use client';

import type { ComponentProps } from 'react';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

interface InputFormProps<FormValues extends FieldValues = FieldValues> extends Omit<
  ComponentProps<'input'>,
  'className'
> {
  readonly name: Path<FormValues>;
  readonly label?: string;
  readonly classNames?: {
    readonly label?: string;
    readonly wrapper?: string;
    readonly input?: string;
  };
}

function InputForm<FormValues extends FieldValues = FieldValues>(props: InputFormProps<FormValues>) {
  const { name, label, classNames, ...inputProps } = props;

  const context = useFormContext<FormValues>();

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={classNames?.wrapper}>
          <FieldLabel htmlFor={field.name} className={classNames?.label}>
            {label}
          </FieldLabel>
          <Input
            {...inputProps}
            id={field.name}
            aria-invalid={fieldState.invalid}
            className={classNames?.input}
            {...context.register(name, {
              setValueAs: (v) => (v == '' || v == null ? undefined : v),
              onChange: (evt) => (evt.target.value.trim() === '' ? null : evt.target.value),
            })}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { InputForm, type InputFormProps };
