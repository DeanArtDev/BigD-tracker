import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { WysiwygEditor, type WysiwygEditorProps } from '@/shared/ui-kit/ui/wysiwyg';
import { EditTogglePlugin } from '@/shared/ui-kit/ui/wysiwyg/plugins';
import { cn } from '@/shared/ui-kit/utils';
import { type FieldValues, type Path } from 'react-hook-form';

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
  required = false,
  editable = true,
  placeholder,
  wysiwygController,
  classNames,
  onDirtyChange,
}: WysiwygFormProps<FormValues>) {
  return (
    <FormField
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={cn('flex grow', classNames?.wrapper)}>
            {label && (
              <FormLabel className={classNames?.label}>
                <RequiredSign on={required}>{label}</RequiredSign>
              </FormLabel>
            )}

            <FormControl>
              <WysiwygEditor
                disabled={field.disabled}
                config={{ namespace: name, editable }}
                afterSlot={
                  <EditTogglePlugin
                    className="toggle-button absolute top-2 right-2"
                    disabled={field.disabled}
                  />
                }
                state={field.value}
                placeholder={placeholder}
                controller={wysiwygController}
                onDirtyChange={onDirtyChange}
              />
            </FormControl>

            {isErrorMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

export { WysiwygForm, type WysiwygFormProps };
