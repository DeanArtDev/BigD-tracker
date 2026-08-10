'use client';

import type { ComponentProps } from 'react';
import { Controller, type FieldValues, type Path } from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '../ui/field';
import { Switch } from '../ui/switch';

type SwitchFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof Switch>,
  'checked' | 'defaultChecked' | 'name' | 'onCheckedChange'
> & {
  readonly name: Path<FormValues>;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly onCheckedChange?: (value: boolean) => void;
  readonly classNames?: {
    readonly wrapper?: string;
    readonly label?: string;
  };
};

function SwitchForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  classNames,
  disabled = false,
  onCheckedChange,
  ...switchProps
}: SwitchFormProps<FormValues>) {
  return (
    <Controller<FormValues>
      name={name}
      render={({ field, fieldState }) => (
        <Field
          data-disabled={disabled || field.disabled}
          data-invalid={fieldState.invalid}
          className={classNames?.wrapper}
        >
          {label && (
            <FieldLabel htmlFor={field.name} className={classNames?.label}>
              {label}
            </FieldLabel>
          )}

          <Switch
            {...switchProps}
            ref={field.ref}
            id={field.name}
            name={field.name}
            checked={Boolean(field.value)}
            disabled={disabled || field.disabled}
            aria-invalid={fieldState.invalid}
            onBlur={field.onBlur}
            onCheckedChange={(value) => {
              field.onChange(value);
              onCheckedChange?.(value);
            }}
          />

          {isErrorMessage && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { SwitchForm, type SwitchFormProps };
