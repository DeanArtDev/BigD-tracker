import { useExerciseCreate, useExerciseUpdate } from '@/entity/exercises';
import { ExerciseTypeSelectForm } from '@/entity/exercises/ui';
import type { ApiDto } from '@/shared/api/types';
import { ErrorMessageForm, InputForm, TextareaForm } from '@/shared/components/form';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { Form } from '@/shared/ui-kit/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { validationSchema } from './manage-exercise-template-validation';
import { RepetitionsBlock } from './repetitions-block';

type ManageExerciseTemplateFormData = z.input<typeof validationSchema>;
type SubmitFormData = z.output<typeof validationSchema>;

interface ManageExerciseTemplateFormProps {
  readonly exerciseTemplate?: ApiDto['ExerciseWithRepetitionsDto'];
  readonly onSuccess?: (action: 'create' | 'update') => void;
}

function ManageExerciseTemplateForm({
  exerciseTemplate,
  onSuccess,
}: ManageExerciseTemplateFormProps) {
  const isCreating = exerciseTemplate == null;

  const { create, isPending: isCreatePending } = useExerciseCreate();
  const { update, isPending: isUpdatePending } = useExerciseUpdate();
  const isLoading = isCreatePending || isUpdatePending;

  const form = useForm<ManageExerciseTemplateFormData, any, SubmitFormData>({
    resolver: zodResolver(validationSchema),
    reValidateMode: 'onChange',
    disabled: isLoading,
    values:
      exerciseTemplate != null
        ? {
            type: exerciseTemplate.type,
            name: exerciseTemplate.name,
            description: exerciseTemplate.description ?? undefined,
            url: exerciseTemplate.exampleUrl ?? undefined,
            repetitions: exerciseTemplate.repetitions.map((rep) => ({
              id: rep.id ?? undefined,
              targetWeight: +rep.targetWeight,
              targetCount: rep.targetCount,
              targetBreak: rep.targetBreak,
            })),
          }
        : undefined,
    defaultValues: {
      type: 'ANAEROBIC',
      url: undefined,
      name: undefined,
      description: undefined,
      repetitions: [],
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-8 flex flex-col grow w-full justify-start p-2.5 sm:p-4"
        onSubmit={form.handleSubmit((formData) => {
          if (isCreating) {
            create(
              {
                body: {
                  data: {
                    name: formData.name,
                    type: formData.type,
                    description: formData.description,
                    exampleUrl: formData.url,
                    repetitions: formData.repetitions.map((rep) => ({
                      targetBreak: rep.targetBreak,
                      targetCount: rep.targetCount,
                      targetWeight: rep.targetWeight.toString(),
                    })),
                  },
                },
              },
              { onSuccess: () => void onSuccess?.('create') },
            );
          } else {
            if (exerciseTemplate == null) return;
            update(
              {
                params: { path: { exerciseId: exerciseTemplate.id } },
                body: {
                  data: {
                    name: formData.name,
                    type: formData.type,
                    description: formData.description,
                    exampleUrl: formData.url,
                    repetitions: formData.repetitions.map((rep) => ({
                      id: rep.id,
                      targetBreak: rep.targetBreak,
                      targetCount: rep.targetCount,
                      targetWeight: rep.targetWeight.toString(),
                    })),
                  },
                },
              },
              { onSuccess: () => void onSuccess?.('update') },
            );
          }
        })}
      >
        <InputForm required name="name" label="Название" placeholder="Наш любимый жим лежа?" />

        <ExerciseTypeSelectForm required />

        <TextareaForm
          name="description"
          label="Описание"
          placeholder="Опиши особенности выполнения"
          className="h-[120px] max-h-[350px]"
        />

        <InputForm
          name="url"
          label="Youtube ссылка"
          placeholder="https://www.youtube.com?v=some-video-id"
        />

        <ErrorMessageForm<ManageExerciseTemplateFormData> name="repetitions" />

        <RepetitionsBlock />

        <Button
          className="ml-auto mt-auto"
          type="submit"
          disabled={isLoading || !form.formState.isDirty}
        >
          {isLoading ? <AppLoader inverse size={20} /> : null}
          {isCreating ? 'Создать' : 'Редактировать'}
        </Button>
      </form>
    </Form>
  );
}

export { ManageExerciseTemplateForm, type ManageExerciseTemplateFormData };
