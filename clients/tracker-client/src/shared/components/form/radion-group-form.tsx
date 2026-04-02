import { formPlaceholderValues } from '@/shared/lib/utils/zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { RadioGroup } from '@/shared/ui-kit/ui/radio-group';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';

type RadioGroupFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof RadioGroup>,
  'name'
> & {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
};

function RadioGroupForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  children,
  ...radioGroupProps
}: RadioGroupFormProps<FormValues>) {
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
              <RadioGroup
                {...radioGroupProps}
                {...field}
                value={field.value == null ? formPlaceholderValues.string : field.value}
                defaultValue={formPlaceholderValues.string}
                onValueChange={(value) => void field.onChange(value === '' ? null : value)}
              >
                {children}
              </RadioGroup>
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { RadioGroupForm, type RadioGroupFormProps };
