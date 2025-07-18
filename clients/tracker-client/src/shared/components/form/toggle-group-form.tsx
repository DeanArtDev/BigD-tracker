import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { ToggleGroup } from '@/shared/ui-kit/ui/toggle-group';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';

type ToggleGroupFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof ToggleGroup>,
  'name' | 'type'
> & {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
};

function ToggleGroupForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  children,
  ...toggleGroupProps
}: ToggleGroupFormProps<FormValues>) {
  return (
    <FormField<FormValues>
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            {label && (
              <FormLabel>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <ToggleGroup
                type="single"
                {...toggleGroupProps}
                {...field}
                value={field.value == null ? '' : field.value}
                defaultValue=""
                onValueChange={(value) => void field.onChange(value === '' ? null : value)}
              >
                {children}
              </ToggleGroup>
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { ToggleGroupForm, type ToggleGroupFormProps };
