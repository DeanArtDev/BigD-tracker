import { Button } from '@base-ui/react';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { MaybePromise } from '@/shared/lib';
import { InputForm } from '@/shared/ui-kit/form';
import { GroupFormErrorReactor } from './group-form-error-reactor';

interface GroupFormProps {
  readonly loading: boolean;
  readonly onSubmit: (data: GroupFormData) => MaybePromise<void>;
}

const groupFormSchema = z.object({
  name: z
    .string({ error: 'Имя обязательное поле' })
    .min(3, { error: 'Имя должно иметь не меньше 3 символов' })
    .max(254, { error: 'Слишком длинное имя' }),
});

type GroupFormData = z.input<typeof groupFormSchema>;
type GroupSubmitFormData = z.output<typeof groupFormSchema>;

function GroupForm({ loading, onSubmit }: GroupFormProps) {
  const form = useForm<GroupFormData, unknown, GroupSubmitFormData>({
    defaultValues: { name: undefined },
    mode: 'onSubmit',
    resolver: standardSchemaResolver(groupFormSchema),
    disabled: loading,
    reValidateMode: 'onSubmit',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(async (formData) => {
          await onSubmit(formData);
        })}
      >
        <InputForm name="name" placeholder="Имя группы и Enter" />
        <Button className="hidden" type="submit" />
      </form>

      <GroupFormErrorReactor />
    </FormProvider>
  );
}

export { GroupForm, type GroupFormProps, type GroupFormData, type GroupSubmitFormData };
