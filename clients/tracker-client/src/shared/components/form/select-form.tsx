import { formPlaceholderValues } from '@/shared/lib/utils/zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/shared/ui-kit/ui/select';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';

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
  required = false,
  children,
  placeholder,
  classNames,
  disabled = false,
  ...selectContentProps
}: SelectFormProps<FormValues>) {
  return (
    <FormField<FormValues>
      name={name}
      render={({ field }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { error } = useFormField();

        return (
          <FormItem className={classNames?.wrapper}>
            {label && (
              <FormLabel className={classNames?.label}>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <Select
                {...field}
                disabled={disabled || field.disabled}
                value={field.value ?? formPlaceholderValues.string}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger aria-invalid={Boolean(error)} className={classNames?.trigger}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent {...selectContentProps}>{children}</SelectContent>
              </Select>
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { SelectForm, type SelectFormProps };
