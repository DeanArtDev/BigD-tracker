import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { ToggleGroup } from '@/shared/ui-kit/ui/toggle-group';
import { cn } from '@/shared/ui-kit/utils';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';

type ToggleGroupMultiFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof ToggleGroup>,
  'name' | 'type'
> & {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
};

function ToggleGroupMultiForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  children,
  className,
  ...toggleGroupProps
}: ToggleGroupMultiFormProps<FormValues>) {
  return (
    <FormField<FormValues>
      name={name}
      render={({ field }) => {
        const value = field.value == null ? [] : Array.isArray(field.value) ? field.value : [];
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { error } = useFormField();

        return (
          <FormItem>
            {label && (
              <FormLabel>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <ToggleGroup
                type="multiple"
                data-invalid={error != null}
                {...toggleGroupProps}
                {...field}
                defaultValue={[]}
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
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { ToggleGroupMultiForm, type ToggleGroupMultiFormProps };
