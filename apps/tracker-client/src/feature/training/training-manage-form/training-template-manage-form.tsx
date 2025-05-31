import { useMeSuspense } from '@/entity/auth';
import {
  TrainingTypeSelectForm,
  useTrainingTemplateCreate,
  useTrainingTemplateUpdateAndReplace,
} from '@/entity/trainings';
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

interface TrainingManageFormData {
  readonly name: string;
  readonly description?: string;
  readonly type: ApiDto['TrainingDto']['type'];
  readonly wormUpDuration?: number;
  readonly postTrainingDuration?: number;
}

function TrainingTemplateManageForm({
  training,
  onSuccess,
}: {
  training?: ApiDto['TrainingTemplateDto'];
  onSuccess: () => void;
}) {
  const { me } = useMeSuspense();
  const { create, isPending: isCreating } = useTrainingTemplateCreate();
  const { update, isPending: isUpdating } = useTrainingTemplateUpdateAndReplace();

  const isLoading = isCreating || isUpdating;

  const form = useForm<TrainingManageFormData>({
    resolver: zodResolver(trainingManageValidationSchema),
    values:
      training != null
        ? {
            name: training.name,
            description: training.description,
            wormUpDuration:
              training.wormUpDuration == null
                ? undefined
                : training.wormUpDuration / 1000,
            postTrainingDuration:
              training.postTrainingDuration == null
                ? undefined
                : training.postTrainingDuration / 1000,
            type: training.type,
          }
        : undefined,
    reValidateMode: 'onChange',
    disabled: isLoading,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((formData) => {
          if (training != null) {
            update(
              {
                body: {
                  data: {
                    type: formData.type,
                    name: formData.name,
                    description: formData.description,
                    wormUpDuration:
                      formData.wormUpDuration == null
                        ? undefined
                        : formData.wormUpDuration * 1000,
                    postTrainingDuration:
                      formData.postTrainingDuration == null
                        ? undefined
                        : formData.postTrainingDuration * 1000,
                  },
                },
                params: { path: { trainingId: training.id } },
              },
              { onSuccess },
            );
            return;
          }
          create(
            {
              body: {
                data: {
                  userId: me.id,
                  type: formData.type,
                  name: formData.name,
                  description: formData.description,
                  wormUpDuration: (formData.wormUpDuration ?? 0) * 1000,
                  postTrainingDuration: (formData.postTrainingDuration ?? 0) * 1000,
                },
              },
            },
            { onSuccess },
          );
        })}
        className="space-y-8 flex flex-col"
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
          control={form.control}
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
          <TrainingTypeSelectForm />
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

        <Button
          className="ml-auto min-w-[89px]"
          type="submit"
          disabled={isLoading || !form.formState.isDirty}
        >
          {isLoading ? (
            <AppLoader size={20} />
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
