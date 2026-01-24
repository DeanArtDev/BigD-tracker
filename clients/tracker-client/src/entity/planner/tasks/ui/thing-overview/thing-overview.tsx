import type { ApiDto } from '@/shared/api/types';
import { FormStateEmitter, type FormStateEmitterProps } from '@/shared/components/form';
import { Form } from '@/shared/ui-kit/ui/form';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce, isEqual, isUndefined, omitBy } from 'lodash-es';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { DescriptionBlock } from './components/description-block';
import { SidebarRight } from './components/sidebar-right';
import { ThingOverviewHeader } from './components/thing-overview-header';
import { validationSchema } from './validation-schema';

interface ThingOverviewProps extends FormStateEmitterProps {
  readonly thing: ApiDto['ThingDto'];
  readonly disabled?: boolean;
  readonly onChange?: (thing: ApiDto['ThingDto']) => void;
}

type ThingEditorFormData = z.input<typeof validationSchema>;
type SubmitFormData = z.output<typeof validationSchema>;

function ThingOverview({
  thing,
  disabled,
  emitIsDirty,
  emitIsLoading,
  onChange,
}: ThingOverviewProps) {
  const form = useForm<ThingEditorFormData, any, SubmitFormData>({
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
    disabled,
    values: {
      name: thing.name,
      deadline: thing.deadline != null ? new Date(thing.deadline) : null,
      startDate: thing.startDate != null ? new Date(thing.startDate) : null,
      description: thing.description,
      priority: thing.priority?.toString(),
    },

    resetOptions: {
      keepValues: true,
    },
  });

  const { subscribe, handleSubmit } = form;

  const onSubmit = handleSubmit((formData) => {
    if (thing == null) return;

    const request = {
      ...thing,
      name: formData.name,
      deadline: formData.deadline,
      description: formData.description,
      priority: formData.priority != null ? +formData.priority : undefined,
      startDate: formData.startDate,
    };
    if (!isEqual(omitBy(request, isUndefined), thing)) {
      onChange?.(request);
    }
  });

  useEffect(() => {
    const update = debounce(() => void onSubmit(), 500);
    return subscribe({
      name: ['priority', 'startDate', 'deadline'],
      formState: { values: true },
      callback: update,
    });
  }, [subscribe, onSubmit]);

  return (
    <Form {...form}>
      <form className="flex flex-col grow" noValidate onSubmit={onSubmit}>
        <SidebarProvider className="flex flex-col min-h-fit grow">
          <ThingOverviewHeader
            onOk={onSubmit}
            onCancel={() => void form.resetField('name', { defaultValue: thing.name })}
          />

          <div className="flex grow">
            <div className="relative flex w-full h-full flex-col p-2 sm:p-4 border-t">
              <DescriptionBlock
                onOk={onSubmit}
                onCancel={() =>
                  void form.resetField('description', { defaultValue: thing.description })
                }
              />
            </div>
            <SidebarRight />
          </div>
        </SidebarProvider>
      </form>

      <FormStateEmitter emitIsDirty={emitIsDirty} emitIsLoading={emitIsLoading} />
    </Form>
  );
}

export { ThingOverview, type ThingOverviewProps, type ThingEditorFormData };
