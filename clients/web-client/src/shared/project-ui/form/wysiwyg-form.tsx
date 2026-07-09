'use client';

import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { cn, Field, FieldError, FieldLabel } from '@/shared/ui-kit';
import { WysiwygEditor, type WysiwygEditorProps } from '../wysiwyg';

interface WysiwygFormProps<FormValues extends FieldValues = FieldValues> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly placeholder?: string;
  readonly editable?: boolean;
  readonly disabled?: boolean;
  readonly isErrorMessage?: boolean;
  readonly wysiwygController?: WysiwygEditorProps['controller'];
  readonly classNames?: {
    readonly label?: string;
    readonly wrapper?: string;
    readonly input?: string;
  };
  readonly onDirtyChange?: WysiwygEditorProps['onDirtyChange'];
}

function WysiwygForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  editable = true,
  disabled = false,
  placeholder,
  wysiwygController,
  classNames,
  onDirtyChange,
}: WysiwygFormProps<FormValues>) {
  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field className={cn('flex grow min-h-0 min-w-0', classNames?.wrapper)}>
            {label && <FieldLabel className={classNames?.label}>{label}</FieldLabel>}

            <WysiwygEditor
              disabled={field.disabled || disabled}
              config={{ namespace: name, editable }}
              state={field.value}
              placeholder={placeholder}
              controller={wysiwygController}
              onDirtyChange={onDirtyChange}
            />

            {isErrorMessage && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export { WysiwygForm, type WysiwygFormProps };
