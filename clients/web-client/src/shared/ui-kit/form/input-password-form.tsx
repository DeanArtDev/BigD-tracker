'use client';

import { Eye, EyeOff } from 'lucide-react';
import { ComponentProps, ReactNode, useState } from 'react';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import { formElementsValues } from './form-schema-utils';
import { Button } from '../ui/button';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';

interface InputPasswordFormProps<FormValues extends FieldValues = FieldValues> extends Omit<
  ComponentProps<typeof Input>,
  'className'
> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly isErrorMessage?: boolean;
  readonly label?: ReactNode;
  readonly classNames?: {
    readonly label?: string;
    readonly wrapper?: string;
    readonly input?: string;
  };
}

function InputPasswordForm<FormValues extends FieldValues = FieldValues>(props: InputPasswordFormProps<FormValues>) {
  const { name, label, classNames, isErrorMessage, ...inputProps } = props;
  const [visible, setVisible] = useState(false);
  const context = useFormContext<FormValues>();

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={classNames?.wrapper}>
          <FieldLabel htmlFor={field.name} className={classNames?.label}>
            {label}
          </FieldLabel>

          <InputGroup>
            <InputGroupInput
              type={visible ? 'text' : 'password'}
              {...inputProps}
              id={field.name}
              aria-invalid={fieldState.invalid}
              className={classNames?.input}
              {...context.register(name, {
                setValueAs: (v) => (v == '' || v == null ? formElementsValues.inputPassword.value : v),
                onChange: (evt) =>
                  evt.target.value.trim() === '' ? formElementsValues.inputPassword.changeResult : evt.target.value,
              })}
            />

            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
                aria-pressed={visible}
                className="text-muted-foreground hover:text-foreground size-8 hover:bg-transparent"
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </InputGroupAddon>
          </InputGroup>

          {isErrorMessage && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { InputPasswordForm };
