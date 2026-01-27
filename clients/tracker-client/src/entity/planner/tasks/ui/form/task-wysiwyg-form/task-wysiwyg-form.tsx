import { TaskWysiwyg } from '../../task-wysiwyg';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui-kit/ui/form';
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import type { WysiwygEditorProps } from '@/shared/ui-kit/ui/wysiwyg';
import { cn } from '@/shared/ui-kit/utils';
import { type FieldValues, type Path } from 'react-hook-form';

interface TaskWysiwygFormProps<FormValues extends FieldValues = FieldValues> {
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

function TaskWysiwygForm<FormValues extends FieldValues = FieldValues>({
  name,
  label,
  isErrorMessage = true,
  required = false,
  editable = false,
  placeholder,
  wysiwygController,
  classNames,
  onDirtyChange,
}: TaskWysiwygFormProps<FormValues>) {
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
              <TaskWysiwyg
                name={name}
                state={field.value}
                editable={editable}
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

export { TaskWysiwygForm, type TaskWysiwygFormProps };
