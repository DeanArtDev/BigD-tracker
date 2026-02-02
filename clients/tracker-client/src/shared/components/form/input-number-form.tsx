import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { Input } from '@/shared/ui-kit/ui/input';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import type { ComponentProps } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';

interface InputNumberFormProps<FormValues extends FieldValues = FieldValues> extends Omit<
  ComponentProps<'input'>,
  'className' | 'type'
> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly isErrorMessage?: boolean;
  readonly inputMode?: 'numeric' | 'decimal';
  readonly classNames?: {
    readonly wrapper?: string;
    readonly label?: string;
    readonly input?: string;
  };
}

function InputNumberForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  inputMode = 'numeric',
  isErrorMessage = false,
  required = false,
  classNames,
  ...inputProps
}: InputNumberFormProps<FormValues>) {
  const context = useFormContext<FormValues>();

  return (
    <FormField
      name={name}
      render={() => {
        return (
          <FormItem className={classNames?.wrapper}>
            {label && (
              <FormLabel className={classNames?.label}>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <Input
                {...inputProps}
                inputMode={inputMode}
                type="number"
                {...context.register(name, {
                  setValueAs: (v) =>
                    v === '' || v == null ? undefined : normalizeToNumber(String(v)),
                  onChange: (evt) =>
                    evt.target.value.trim() === '' ? null : normalizeToNumber(evt.target.value),
                })}
                className={classNames?.input}
              />
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

function normalizeToNumber(raw: string): number | undefined {
  if (!raw) return undefined;
  let s = raw.replace(',', '.');
  if (s.startsWith('.')) s = '0' + s;
  const n = Number(s);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export { InputNumberForm, type InputNumberFormProps };
