import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { Switch } from '@/shared/ui-kit/ui/switch';
import { type ComponentProps } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';

type SwitchFormProps<FormValues extends FieldValues = FieldValues> = Omit<
  ComponentProps<typeof Switch>,
  'name' | 'type' | 'onCheckedChange'
> & {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
};

function SwitchForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  children,
  ...switchProps
}: SwitchFormProps<FormValues>) {
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
              <Switch {...switchProps} {...field} checked={Boolean(field.value)} onCheckedChange={field.onChange}>
                {children}
              </Switch>
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { SwitchForm, type SwitchFormProps };
