import { InputForm, TextareaForm } from '@/shared/components/form';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Form } from '@/shared/ui-kit/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { validationSchema } from './validation-schema';
import { Button } from '@/shared/ui-kit/ui/button';

type GroupCreateFormData = z.input<typeof validationSchema>;
type SubmitFormData = z.output<typeof validationSchema>;

interface GroupAddFormProps {
  readonly isLoading?: boolean;
  readonly onCancel: () => void;
  readonly onSubmit: (formResult: { name: string; description?: string }) => void;
}

function GroupAddForm({ isLoading, onSubmit, onCancel }: GroupAddFormProps) {
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const form = useForm<GroupCreateFormData, any, SubmitFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    disabled: isLoading,
    defaultValues: {
      name: undefined,
      description: undefined,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col grow gap-2"
        noValidate
        onSubmit={form.handleSubmit((formData) => void onSubmit(formData))}
      >
        <InputForm name="name" autoFocus required placeholder="Имя" />
        <TextareaForm
          className="resize-none max-h-[400px]"
          name="description"
          placeholder="Описание"
        />

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLoading}
            onClick={() => {
              viaConfirmation({
                isNeedConfirm: () => form.formState.isDirty,
                callback: onCancel,
              });
            }}
          >
            Отмена
          </Button>
          <Button type="submit" size="sm" disabled={isLoading || !form.formState.isDirty}>
            {isLoading ? <AppLoader inverse size={20} /> : null}
            Создать
          </Button>
        </div>
      </form>

      {confirmHolder}
    </Form>
  );
}

export { GroupAddForm, type GroupAddFormProps };
