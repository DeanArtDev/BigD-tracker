'use client';

import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { cn, Field, FieldError, FieldLabel } from '@/shared/ui-kit';
import { WysiwygEditor, type WysiwygEditorProps } from '../wysiwyg';
import { EditTogglePlugin } from '../wysiwyg/plugins';

interface WysiwygFormProps<FormValues extends FieldValues = FieldValues> {
  readonly name: Path<FormValues>;
  readonly required?: boolean;
  readonly label?: string;
  readonly placeholder?: string;
  readonly editable?: boolean;
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
          <Field className={cn('flex grow', classNames?.wrapper)}>
            {label && <FieldLabel className={classNames?.label}>{label}</FieldLabel>}

            <WysiwygEditor
              disabled={field.disabled}
              config={{ namespace: name, editable }}
              afterSlot={
                <EditTogglePlugin className="toggle-button absolute top-2 right-2" disabled={field.disabled} />
              }
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
