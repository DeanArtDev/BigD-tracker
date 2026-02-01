import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { Input } from '@/shared/ui-kit/ui/input';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';

interface InputFormProps<FormValues extends FieldValues = FieldValues> extends Omit<
  ComponentProps<'input'>,
  'className'
> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly classNames?: {
    readonly label?: string;
    readonly wrapper?: string;
    readonly input?: string;
  };
}

function InputForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  classNames,
  ...inputProps
}: InputFormProps<FormValues>) {
  const context = useFormContext<FormValues>();

  return (
    <FormField
      name={name}
      render={() => {
        return (
          <FormItem className={classNames?.wrapper}>
            {label && (
              <FormLabel htmlFor={name} className={classNames?.label}>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <Input
                id={name}
                className={classNames?.input}
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
