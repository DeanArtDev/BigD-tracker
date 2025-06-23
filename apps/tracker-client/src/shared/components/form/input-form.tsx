import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { Input } from '@/shared/ui-kit/ui/input';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';

interface InputFormProps<FormValues extends FieldValues = FieldValues>
  extends ComponentProps<'input'> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
}

function InputForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  ...inputProps
}: InputFormProps<FormValues>) {
  const context = useFormContext<FormValues>();

  return (
    <FormField
      name={name}
      render={() => {
        return (
          <FormItem>
            {label && (
              <FormLabel>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <Input
                {...inputProps}
                {...context.register(name, {
                  setValueAs: (v) => (v === '' ? undefined : v),
                  onChange: (evt) =>
                    evt.target.value.trim() === '' ? undefined : evt.target.value,
                })}
              />
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { InputForm, type InputFormProps };
