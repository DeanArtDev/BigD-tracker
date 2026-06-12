'use client';

import { type ComponentProps } from 'react';
import { Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form';
import { formElementsValues } from './form-schema-utils';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Textarea } from '../ui/textarea';

interface TextAreaFormProps<FormValues extends FieldValues = FieldValues> extends Omit<
  ComponentProps<'textarea'>,
  'className'
> {
  readonly name: Path<FormValues>;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly classNames?: {
    textarea?: string;
    label?: string;
    wrapper?: string;
  };
}

function TextareaForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  classNames,
  ...textAreaProps
}: TextAreaFormProps<FormValues>) {
  const context = useFormContext<FormValues>();

  return (
    <Controller
      name={name}
      render={({ fieldState }) => {
        return (
          <Field className={classNames?.wrapper}>
            {label && <FieldLabel className={classNames?.label}>{label}</FieldLabel>}

            <Textarea
              className={classNames?.textarea}
              {...textAreaProps}
              {...context.register(name, {
                setValueAs: (v) => (v === '' || v == null ? formElementsValues.textArea.value : v),
                onChange: (evt) =>
                  evt.target.value.trim() === '' ? formElementsValues.textArea.changeResult : evt.target.value,
              })}
            />

            {isErrorMessage && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export { TextareaForm, type TextAreaFormProps };
