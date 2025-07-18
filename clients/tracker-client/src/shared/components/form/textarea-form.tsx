import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { Textarea } from '@/shared/ui-kit/ui/textarea';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';

interface TextAreaFormProps<FormValues extends FieldValues = FieldValues>
  extends ComponentProps<'textarea'> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
}

function TextareaForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  ...textAreaProps
}: TextAreaFormProps<FormValues>) {
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
              <Textarea
                {...textAreaProps}
                {...context.register(name, {
                  setValueAs: (v) => (v === '' || v == null ? undefined : v),
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

export { TextareaForm, type TextAreaFormProps };
