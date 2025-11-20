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
  readonly inputClassName?: string;
  readonly isErrorMessage?: boolean;
}

function InputForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  className,
  inputClassName,
  ...inputProps
}: InputFormProps<FormValues>) {
  const context = useFormContext<FormValues>();

  return (
    <FormField
      name={name}
      render={() => {
        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <Input
                className={inputClassName}
                {...inputProps}
                {...context.register(name, {
                  setValueAs: (v) => (v == '' || v == null ? undefined : v),
                  onChange: (evt) => (evt.target.value.trim() === '' ? null : evt.target.value),
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
