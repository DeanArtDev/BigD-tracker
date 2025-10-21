import type { ApiDto } from '@/shared/api/types';
import {
  DatePickerForm,
  FormStateEmitter,
  InputForm,
  TextareaForm,
  ToggleGroupForm,
} from '@/shared/components/form';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { Form } from '@/shared/ui-kit/ui/form';
import { ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { subDays } from 'date-fns';
import { Circle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { validationSchema } from './validation-schema';

type ThingManagerFormData = z.input<typeof validationSchema>;
type SubmitFormData = z.output<typeof validationSchema>;

type SubmitResponse = Omit<ApiDto['CreateThingReq']['data'], 'groupId'>;

interface ThingManagerFormProps {
  readonly isLoading: boolean;
  readonly emitIsLoading?: (value: boolean) => void;
  readonly emitIsDirty?: (value: boolean) => void;
  readonly onSubmit: (thing: SubmitResponse) => void;
}

function ThingManagerForm(props: ThingManagerFormProps) {
  const { isLoading, emitIsDirty, emitIsLoading, onSubmit } = props;
  const isCreating = true;

  const form = useForm<ThingManagerFormData, any, SubmitFormData>({
    resolver: zodResolver(validationSchema),
    reValidateMode: 'onChange',
    disabled: isLoading,
    defaultValues: {
      name: undefined,
      deadline: undefined,
      description: undefined,
      startDate: undefined,
      priority: '4',
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-8 flex flex-col grow w-full justify-start"
        onSubmit={form.handleSubmit((formData) => {
          onSubmit({
            name: formData.name,
            deadline: formData.deadline,
            description: formData.description,
            priority: formData.priority != null ? +formData.priority : undefined,
            startDate: formData.startDate,
          });
        })}
      >
        <InputForm<ThingManagerFormData> autoFocus required name="name" label="Название" placeholder="Имя" />

        <TextareaForm<ThingManagerFormData>
          name="description"
          label="Описание"
          placeholder="Опиши свое дело"
          className="min-h-[200px]"
        />

        <div className="grid gap-4 grid-cols-2">
          <DatePickerForm<ThingManagerFormData>
            label="Дата начала"
            name="startDate"
            min={subDays(new Date(), 1)}
            onChange={() => void form.setValue('deadline', undefined, { shouldDirty: false })}
          />

          <DatePickerForm<ThingManagerFormData>
            label="Дедлайн"
            name="deadline"
            min={new Date(form.getValues('startDate') ?? '')}
          />
        </div>


        <div className="flex gap-4 justify-between mt-auto">
          <ToggleGroupForm name="priority">
            <ToggleGroupItem value="1" className="w-[50px]">
              <Circle strokeWidth={3} color="var(--priority-1)" />
            </ToggleGroupItem>

            <ToggleGroupItem value="2" className="w-[50px]">
              <Circle strokeWidth={3} color="var(--priority-2)" />
            </ToggleGroupItem>

            <ToggleGroupItem value="3" className="w-[50px]">
              <Circle strokeWidth={3} color="var(--priority-3)" />
            </ToggleGroupItem>

            <ToggleGroupItem value="4" className="w-[50px]">
              <Circle strokeWidth={3} color="var(--priority-4)" />
            </ToggleGroupItem>
          </ToggleGroupForm>

          <Button
            type="submit"
            className="ml-auto mt-auto"
            disabled={!form.formState.isDirty || isLoading}
          >
            {isLoading ? <AppLoader inverse size={20} /> : null}
            {isCreating ? 'Создать' : 'Редактировать'}
          </Button>
        </div>

        <FormStateEmitter
          isLoading={isLoading}
          emitIsDirty={emitIsDirty}
          emitIsLoading={emitIsLoading}
        />
      </form>
    </Form>
  );
}

export { ThingManagerForm, type ThingManagerFormProps };
