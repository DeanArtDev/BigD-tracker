'use client';

import type { ComponentProps } from 'react';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import { formElementsValues } from './form-schema-utils';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

interface InputFormProps<FormValues extends FieldValues = FieldValues> extends Omit<
  ComponentProps<'input'>,
  'className'
> {
  readonly name: Path<FormValues>;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly classNames?: {
    readonly label?: string;
    readonly wrapper?: string;
    readonly input?: string;
  };
}

function InputForm<FormValues extends FieldValues = FieldValues>(props: InputFormProps<FormValues>) {
  const { name, label, classNames, isErrorMessage, ...inputProps } = props;

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
              setValueAs: (v) => (v == '' || v == null ? formElementsValues.inputText.value : v),
              onChange: (evt) =>
                evt.target.value.trim() === '' ? formElementsValues.inputText.changeResult : evt.target.value,
            })}
          />
          {isErrorMessage && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { InputForm, type InputFormProps };
