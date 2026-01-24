import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { Input } from '@/shared/ui-kit/ui/input';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import type { ComponentProps } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';

interface InputNumberFormProps<
  FormValues extends FieldValues = FieldValues,
> extends ComponentProps<'input'> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly inputMode?: 'numeric' | 'decimal';
}

function InputNumberForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  inputMode = 'numeric',
  isErrorMessage = false,
  required = false,
  ...inputProps
}: InputNumberFormProps<FormValues>) {
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
                inputMode={inputMode}
                type="number"
                {...context.register(name, {
                  setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
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

export { InputNumberForm, type InputNumberFormProps };
