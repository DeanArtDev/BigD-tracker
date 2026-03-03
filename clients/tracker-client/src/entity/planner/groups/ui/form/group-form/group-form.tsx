import { ButtonLoading } from '@/shared/components/button-loading';
import { FormStateEmitter, type FormStateEmitterProps, InputForm, WysiwygForm } from '@/shared/components/form';
import { Form } from '@/shared/ui-kit/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { validationSchema } from './validation-schema';

type GroupFormData = z.input<typeof validationSchema>;
type GroupSubmitFormData = z.output<typeof validationSchema>;

interface GroupFormProps extends FormStateEmitterProps {
  readonly closeSlot?: ReactNode;
  readonly isLoading?: boolean;
  readonly onSubmit: (formResult: { name: string; description?: string }) => void;
}

function GroupForm({ isLoading = false, emitIsLoading, emitIsDirty, closeSlot, onSubmit }: GroupFormProps) {
  const form = useForm<GroupFormData, any, GroupSubmitFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    disabled: isLoading,
    defaultValues: {
      name: undefined,
      description: undefined,
      isDescriptionDirty: false,
    },
  });

  const wysiwygController = useRef<{ readonly getStateAsString?: () => string } | null>(null);

  return (
    <Form {...form}>
      <form
        className="group-form flex flex-col grow min-h-0 h-full min-w-0 gap-2"
        noValidate
        onSubmit={form.handleSubmit(async (formData) => {
          const description = wysiwygController.current?.getStateAsString?.();
          const isValid = await form.trigger('description');
          if (!isValid) {
            toast.error('Описание содержит ошибки', {
              position: 'top-center',
            });
            return;
          }

          onSubmit({ name: formData.name, description });
        })}
      >
        <div className="flex gap-2">
          <InputForm classNames={{ wrapper: 'grow' }} name="name" autoFocus required placeholder="Имя" />

          {closeSlot}
        </div>

        <WysiwygForm
          name="description"
          placeholder="Опишите группу"
          wysiwygController={wysiwygController}
          onDirtyChange={(isDirty) => {
            form.setValue('isDescriptionDirty', isDirty, { shouldDirty: true });
          }}
        />

        <div className="flex gap-2 justify-end">
          <ButtonLoading size="sm" type="submit" isLoading={isLoading} disabled={!form.formState.isDirty}>
            Создать
          </ButtonLoading>
        </div>
      </form>

      <FormStateEmitter isLoading={isLoading} emitIsDirty={emitIsDirty} emitIsLoading={emitIsLoading} />
    </Form>
  );
}

export { GroupForm, type GroupFormProps };
