import { TrainingTypeSelectForm } from '@/entity/trainings';
import { ExerciseAddingBlock } from './exercise-adding-block/exercise-adding-block';
import type { ApiDto } from '@/shared/api/types';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui-kit/ui/form';
import { Input } from '@/shared/ui-kit/ui/input';
import { Textarea } from '@/shared/ui-kit/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { trainingManageValidationSchema } from './training-manage-validation';
import { useSubmit } from './use-submit';

interface TrainingManageFormData {
  readonly name: string;
  readonly description?: string;
  readonly type: ApiDto['TrainingTemplateAggregationDto']['type'];
  readonly wormUpDuration?: number;
  readonly postTrainingDuration?: number;
  readonly exerciseList: {
    readonly id: number;
    readonly name: string;
    readonly sets: number;
    readonly repetitions: number;
  }[];
}

function TrainingTemplateManageForm({
  training,
  onSuccess,
}: {
  training?: ApiDto['TrainingTemplateAggregationDto'];
  onSuccess: () => void;
}) {
  const { isLoading, handleSubmitForm } = useSubmit({
    templateId: training?.id,
    onSuccess,
  });

  const form = useForm<TrainingManageFormData>({
    resolver: zodResolver(trainingManageValidationSchema),
    values:
      training != null
        ? {
            name: training.name,
            description: training.description,
            wormUpDuration: training.wormUpDuration,
            postTrainingDuration: training.postTrainingDuration,
            type: training.type,
            exerciseList: training.exercises.map((i) => ({
              id: i.id,
              name: i.name,
              sets: 3,
              repetitions: 12,
            })),
          }
        : undefined,
    reValidateMode: 'onChange',
    disabled: isLoading,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-8 flex flex-col grow w-full"
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input placeholder="Мошная тренировка ног" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Опиши на что обратить внимание"
                  className="max-h-[150px]"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <TrainingTypeSelectForm disabled={form.formState.disabled} />
        </div>

        <div className="grid grid-cols-2 gap-3 min-h-[108px] items-start">
          <FormField
            name="wormUpDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Время разминки</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="15 минут" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="postTrainingDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Время заминки</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="20 минут" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ExerciseAddingBlock />

        <Button
          className="ml-auto mt-auto min-w-[89px]"
          type="submit"
          disabled={isLoading || !form.formState.isDirty}
        >
          {isLoading ? (
            <AppLoader inverse size={20} />
          ) : training == null ? (
            'Создать'
          ) : (
            'Редактировать'
          )}
        </Button>
      </form>
    </Form>
  );
}

export { TrainingTemplateManageForm, type TrainingManageFormData };
