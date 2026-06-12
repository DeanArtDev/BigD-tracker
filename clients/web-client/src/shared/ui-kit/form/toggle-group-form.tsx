'use client';

import { type ComponentProps } from 'react';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/shared/ui-kit';
import { ToggleGroup } from '@/shared/ui-kit/ui/toggle-group';
import { formElementsValues } from './form-schema-utils';

type ToggleGroupFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof ToggleGroup>,
  'name' | 'type'
> & {
  readonly name: Path<FormValues>;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
};

function ToggleGroupForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  children,
  ...toggleGroupProps
}: ToggleGroupFormProps<FormValues>) {
  return (
    <Controller<FormValues>
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field>
            {label && <FieldLabel>{label}</FieldLabel>}

            <ToggleGroup
              type="single"
              {...toggleGroupProps}
              {...field}
              value={field.value == null ? formElementsValues.toggleGroups.value : field.value}
              defaultValue={formElementsValues.toggleGroups.value}
              onValueChange={(value) =>
                void field.onChange(value === '' ? formElementsValues.toggleGroups.changeResult : value)
              }
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

export { ToggleGroupForm, type ToggleGroupFormProps };
