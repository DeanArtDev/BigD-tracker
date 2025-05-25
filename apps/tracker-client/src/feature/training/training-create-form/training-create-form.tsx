import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui-kit/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/shared/ui-kit/ui/input';
import type { ApiDto } from '@/shared/api/types';
import { Textarea } from '@/shared/ui-kit/ui/textarea';
import { StartDatePicker } from './start-date-picker';
import { Button } from '@/shared/ui-kit/ui/button';
import { TrainingTypeSelectForm, useTrainingCreate } from '@/entity/trainings';
import { trainingCreateValidationSchema } from './training-create-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMeSuspense } from '@/entity/auth';
import { LoaderCircle } from 'lucide-react';

interface TrainingCreateFormData {
  readonly name: string;
  readonly description?: string;
  readonly type: ApiDto['TrainingDto']['type'];
  readonly startDate?: Date;
  readonly wormUpDuration?: number;
  readonly postTrainingDuration?: number;
}

function TrainingCreateForm({ onSuccess }: { onSuccess: () => void }) {
  const { me } = useMeSuspense();
  const { create, isPending } = useTrainingCreate();

  const form = useForm<TrainingCreateFormData>({
    resolver: zodResolver(trainingCreateValidationSchema),
    defaultValues: {
      startDate: new Date(Date.now()),
    },
    reValidateMode: 'onSubmit',
    disabled: isPending,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((formData) => {
          create(
            {
              body: {
                data: {
                  userId: me.id,
                  type: formData.type,
                  name: formData.name,
                  description: formData.description,
                  startDate: formData.startDate?.toISOString(),
                  wormUpDuration: (formData.wormUpDuration ?? 0) * 1000,
                  postTrainingDuration: (formData.postTrainingDuration ?? 0) * 1000,
                },
              },
            },
            {
              onSuccess,
            },
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
          <StartDatePicker />

          <TrainingTypeSelectForm />
        </div>

        <div className="flex flex-wrap gap-3">
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

        <Button className="ml-auto min-w-[89px]" type="submit" disabled={isPending}>
          {isPending ? <LoaderCircle className="animate-spin" /> : 'Создать'}
        </Button>
      </form>
    </Form>
  );
}

export { TrainingCreateForm, type TrainingCreateFormData };
