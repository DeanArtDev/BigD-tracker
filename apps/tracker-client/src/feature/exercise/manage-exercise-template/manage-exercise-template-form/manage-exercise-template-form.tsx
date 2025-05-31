import { useMeSuspense } from '@/entity/auth';
import { useExerciseTemplateCreate, useExerciseTemplateUpdate } from '@/entity/exercises';
import { ExerciseTypeSelectForm } from '@/entity/exercises/ui/exercise-type-select-form';
import { validationSchema } from '@/feature/exercise/manage-exercise-template/manage-exercise-template-form/manage-exercise-template-validation';
import type { ApiDto } from '@/shared/api/types';
import type { Undefinedable } from '@/shared/lib/type-helpers';
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
import { RequiredSign } from '@/shared/ui-kit/ui/require-sign';
import { Textarea } from '@/shared/ui-kit/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

type ManageExerciseTemplateFormData = {
  readonly name: string;
  readonly type: ApiDto['ExerciseTemplateDto']['type'];
} & Undefinedable<{
  readonly description: string;
  readonly url: string;
}>;

interface ManageExerciseTemplateFormProps {
  readonly exerciseTemplate?: ApiDto['ExerciseTemplateDto'];
  readonly onSuccess?: () => void;
}

function ManageExerciseTemplateForm({
  exerciseTemplate,
  onSuccess,
}: ManageExerciseTemplateFormProps) {
  const { me } = useMeSuspense();
  const isCreating = exerciseTemplate == null;

  const { create, isPending: isCreatePending } = useExerciseTemplateCreate();
  const { update, isPending: isUpdatePending } = useExerciseTemplateUpdate();
  const isLoading = isCreatePending || isUpdatePending;

  const form = useForm<ManageExerciseTemplateFormData>({
    resolver: zodResolver(validationSchema),
    reValidateMode: 'onChange',
    values:
      exerciseTemplate != null
        ? {
            type: exerciseTemplate?.type,
            description: exerciseTemplate?.description,
            name: exerciseTemplate?.name,
            url: exerciseTemplate?.exampleUrl,
          }
        : undefined,
    defaultValues: {
      type: 'ANAEROBIC',
    },
    disabled: isLoading,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((formData) => {
          if (isCreating) {
            create(
              {
                body: {
                  data: {
                    userId: me.id,
                    name: formData.name,
                    type: formData.type,
                    description: formData.description,
                    exampleUrl: formData.url,
                  },
                },
              },
              { onSuccess },
            );
          } else {
            if (exerciseTemplate == null) return;
            update(
              {
                params: { path: { templateId: exerciseTemplate.id } },
                body: {
                  data: {
                    name: formData.name,
                    type: formData.type,
                    description: formData.description,
                    exampleUrl: formData.url,
                  },
                },
              },
              { onSuccess },
            );
          }
        })}
        className="space-y-8 flex flex-col"
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredSign>Название</RequiredSign>
              </FormLabel>
              <FormControl>
                <Input placeholder="Наш любимый жим лежа?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ExerciseTypeSelectForm required />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Опиши особенности выполнения"
                  className="h-[120px] max-h-[350px]"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youtube ссылка</FormLabel>
              <FormControl>
                <Input placeholder="https://www.youtube.com?v=some-video-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="ml-auto"
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
