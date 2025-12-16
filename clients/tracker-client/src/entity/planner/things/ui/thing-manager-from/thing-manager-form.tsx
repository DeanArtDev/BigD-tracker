import type { ApiDto } from '@/shared/api/types';
import {
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
import { isFunction } from 'lodash-es';
import { Circle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod/v4';
import { validationSchema } from './validation-schema';

type ThingManagerFormData = z.input<typeof validationSchema>;
type SubmitFormData = z.output<typeof validationSchema>;
type ThingManagerFormReturn = UseFormReturn<ThingManagerFormData, any, SubmitFormData>;

type ThingManagerSubmitData = Omit<ApiDto['CreateThingReq']['data'], 'groupId'>;

interface ThingManagerFormProps {
  readonly isLoading?: boolean;
  readonly dateSlot?: ReactNode | ((form: ThingManagerFormReturn) => ReactNode);
  readonly emitIsLoading?: (value: boolean) => void;
  readonly emitIsDirty?: (value: boolean) => void;
  readonly onSubmit: (thing: ThingManagerSubmitData) => void;
}

function ThingManagerForm(props: ThingManagerFormProps) {
  const { isLoading, dateSlot, emitIsDirty, emitIsLoading, onSubmit } = props;
  const isCreating = true;

  const form = useForm<ThingManagerFormData, any, SubmitFormData>({
    resolver: zodResolver(validationSchema),
    reValidateMode: 'onChange',
    mode: 'onSubmit',
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
        className="space-y-3 md:space-y-6 flex flex-col grow w-full justify-start"
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
        <InputForm<ThingManagerFormData>
          autoFocus
          required
          name="name"
          label="Название"
          placeholder="Имя"
        />

        <TextareaForm<ThingManagerFormData>
          name="description"
          label="Описание"
          placeholder="Опиши свое дело"
          className="min-h-[100px] md:min-h-[200px]"
        />

        {isFunction(dateSlot) ? dateSlot(form) : dateSlot}

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

export {
  ThingManagerForm,
  type ThingManagerFormProps,
  type ThingManagerSubmitData,
  type ThingManagerFormReturn,
  type ThingManagerFormData,
};
