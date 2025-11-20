import { Button } from '@/shared/ui-kit/ui/button';
import { Calendar } from '@/shared/ui-kit/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui-kit/ui/popover';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { cn } from '@/shared/ui-kit/utils';
import { format, isDate } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';

type CalendarFormProps = Omit<
  ComponentProps<typeof Calendar>,
  'className' | 'classNames' | 'onSelect' | 'disabled'
>;

type DatePickerFormProps<FormValues extends FieldValues = FieldValues> = CalendarFormProps & {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly classNames?: {
    readonly container?: string;
  };
  readonly isErrorMessage?: boolean;
  readonly max?: Date;
  readonly min?: Date;
  readonly renderInput?: (props: { value: Date }) => ReactNode;
  readonly onChange?: () => void;
};

function DatePickerForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  max,
  min,
  isErrorMessage = true,
  required = false,
  disabled = false,
  classNames,
  onChange,
  renderInput,
  ...props
}: DatePickerFormProps<FormValues>) {
  return (
    <FormField<Record<string, Date>>
      name={name}
      render={({ field }) => {
        if (field.value != null && !isDate(field.value)) {
          throw new Error('field.value must be Date type');
        }

        return (
          <FormItem className={classNames?.container}>
            {label && (
              <FormLabel>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <Popover modal>
              <PopoverTrigger asChild>
                <FormControl>
                  {renderInput != null ? (
                    renderInput({ value: field.value })
                  ) : (
                    <Button
                      variant="outline"
                      disabled={disabled || field.disabled}
                      className={cn(
                        'f-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Выбор даты</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  )}
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  {...props}
                  mode="single"
                  locale={ru}
                  defaultMonth={field.value}
                  selected={field.value}
                  disabled={(date) => date > new Date(max ?? '') || date < new Date(min ?? '')}
                  onSelect={(day) => {
                    field.onChange(day ?? null);
                    onChange?.();
                  }}
                />
              </PopoverContent>
            </Popover>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { DatePickerForm, type DatePickerFormProps };
