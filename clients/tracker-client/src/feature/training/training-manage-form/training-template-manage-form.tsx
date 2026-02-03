import { TrainingTypeSelectForm } from '@/entity/trainings';
import { InputForm, InputNumberForm, TextareaForm } from '@/shared/components/form';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { Form } from '@/shared/ui-kit/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { ExerciseAddingBlock } from './exercise-adding-block/exercise-adding-block';
import { trainingManageValidationSchema } from './training-manage-validation';
import { useSubmit } from './use-submit';

type TrainingManageFormData = z.input<typeof trainingManageValidationSchema>;
type SubmitFormData = z.output<typeof trainingManageValidationSchema>;

function TrainingTemplateManageForm({
  templateId,
  onSuccess,
}: {
  templateId?: number;
  onSuccess: () => void;
}) {
  const { trainingTemplate, isLoading, handleSubmitForm } = useSubmit({ templateId, onSuccess });

  const form = useForm<TrainingManageFormData, any, SubmitFormData>({
    resolver: zodResolver(trainingManageValidationSchema),
    values:
      trainingTemplate != null
        ? {
            name: trainingTemplate.name,
            description: trainingTemplate.description,
            wormUpDuration: trainingTemplate.wormUpDuration,
            postTrainingDuration: trainingTemplate.postTrainingDuration,
            type: trainingTemplate.type,
            exercises: trainingTemplate.exercises.map((i) => ({
              id: i.id,
              name: i.name,
              description: i.description,
              type: i.type,
              exampleUrl: i.exampleUrl,
              repetitions: i.repetitions.map((i) => ({
                id: i.id,
                targetCount: i.targetCount,
                targetWeight: +i.targetWeight,
                targetBreak: i.targetBreak,
              })),
            })),
          }
        : undefined,
    reValidateMode: 'onChange',
    disabled: isLoading,
  });

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-8 flex flex-col grow w-full"
      >
        <InputForm required name="name" label="Название" placeholder="Мошная тренировка ног" />

        <TextareaForm
          name="description"
          label="Описание"
          placeholder="Опиши на что обратить внимание"
          classNames={{ textarea: '"max-h-[150px]"' }}
        />

        <div className="grid grid-cols-2 gap-3">
          <TrainingTypeSelectForm disabled={form.formState.disabled} />
        </div>

        <div className="grid grid-cols-2 gap-3 min-h-[108px] items-start">
          <InputNumberForm
            isErrorMessage
            name="wormUpDuration"
            label="Время разминки"
            placeholder="15 минут"
          />

          <InputNumberForm
            isErrorMessage
            name="postTrainingDuration"
            label="Время заминки"
            placeholder="20 минут"
          />
        </div>

        <ExerciseAddingBlock />

        <Button
          className="ml-auto mt-auto min-w-[89px]"
          type="submit"
          disabled={isLoading || !form.formState.isDirty}
        >
          <DataLoader isLoading={isLoading} loadingElement={<AppLoader inverse size={20} />}>
            {trainingTemplate == null ? 'Создать' : 'Редактировать'}
          </DataLoader>
        </Button>
      </form>
    </Form>
  );
}

export { TrainingTemplateManageForm, type TrainingManageFormData, type SubmitFormData };
