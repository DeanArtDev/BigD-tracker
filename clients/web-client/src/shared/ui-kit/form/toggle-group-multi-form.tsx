'use client';

import { type ComponentProps } from 'react';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { formElementsValues } from './form-schema-utils';
import { cn } from '../lib/utils';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { ToggleGroup } from '../ui/toggle-group';

type ToggleGroupMultiFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof ToggleGroup>,
  'name' | 'type'
> & {
  readonly name: Path<FormValues>;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
};

function ToggleGroupMultiForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  children,
  className,
  ...toggleGroupProps
}: ToggleGroupMultiFormProps<FormValues>) {
  return (
    <Controller<FormValues>
      name={name}
      render={({ field, fieldState }) => {
        const value =
          field.value == null
            ? formElementsValues.toggleGroupsMulti.value
            : Array.isArray(field.value)
              ? field.value
              : formElementsValues.toggleGroupsMulti.value;

        return (
          <Field>
            {label && <FieldLabel>{label}</FieldLabel>}

            <ToggleGroup
              type="multiple"
              data-invalid={fieldState.invalid}
              {...toggleGroupProps}
              {...field}
              defaultValue={formElementsValues.toggleGroupsMulti.value}
              className={cn(
                'data-[invalid=true]:**:data-[slot=toggle-group-item]:border',
                'data-[invalid=true]:**:data-[slot=toggle-group-item]:border-destructive',
                className,
              )}
              value={value}
              onValueChange={(value) => void field.onChange(value)}
            >
              {children}
            </ToggleGroup>

            {isErrorMessage && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export { ToggleGroupMultiForm, type ToggleGroupMultiFormProps };
