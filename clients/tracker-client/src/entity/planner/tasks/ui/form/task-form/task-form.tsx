import { useTaskFormValues } from '@/entity/planner/tasks/ui/form/task-form/lib/use-task-form-values';
import { ButtonLoading } from '@/shared/components/button-loading';
import {
  FormStateEmitter,
  type FormStateEmitterProps,
  WysiwygForm,
} from '@/shared/components/form';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Form } from '@/shared/ui-kit/ui/form';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';
import { useWysiwygController } from '@/shared/ui-kit/ui/wysiwyg';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useId } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { TaskPriority } from '../../../lib/constants';
import { type TaskEntity } from '../../../model';
import { TaskHeaderForm } from '../task-header-form';
import { TaskFormSidebarTrigger } from '../task-sidebar-root-form';
import { SidebarErrorCatcher } from './components/sidebar-error-catcher';
import { TaskFormSidebar } from './components/task-form-sidebar';
import { TaskFieldsRulesProvider, useTaskFieldsRulesContext } from './context';
import { validationStrategyByStatus } from './validation-strategy';

interface TaskFormProps extends FormStateEmitterProps {
  readonly task?: Omit<TaskEntity, 'endDate' | 'cancelReason'>;
  readonly afterNameSlot?: ReactNode;
  readonly defaultValue?: {
    readonly startDate?: Date;
    readonly deadline?: Date;
  };
  readonly footerSlot?: (props: { disabled: boolean }) => ReactNode;
  readonly footerSidebarSlot?: (props: { disabled: boolean }) => ReactNode;
  readonly defaultSidebarOpen?: boolean;
  readonly onSubmit?: (data: {
    name: string;
    priority: number;
    deadline?: string;
    startDate?: string;
    weight: number;
    description?: string;
  }) => void;
}

function Component(props: TaskFormProps) {
  const { status } = useTaskFieldsRulesContext();
  const validationSchema = validationStrategyByStatus(status);
  type TaskFormData = z.input<typeof validationSchema>;
  type TaskSubmitFormData = z.output<typeof validationSchema>;

  const isMobile = useIsMobile();

  const {
    task,
    isLoading = false,
    emitIsDirty,
    footerSlot,
    footerSidebarSlot,
    emitIsLoading,
    defaultSidebarOpen = !isMobile,
    afterNameSlot,
    onSubmit,
  } = props;

  const formId = useId();
  const isEdit = task != null;
  const { values, defaultValues } = useTaskFormValues({ task, defaultValue: props?.defaultValue });

  const form = useForm<TaskFormData, any, TaskSubmitFormData>({
    resolver: zodResolver(validationSchema),
    mode: isMobile ? 'onChange' : 'onSubmit',
    disabled: isLoading,
    values,
    defaultValues,
  });

  const { wysiwygController } = useWysiwygController();

  return (
    <Form {...form}>
      <form
        id={formId}
        noValidate
        className="flex grow min-h-0 h-full flex-col"
        onSubmit={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();

          form.handleSubmit(async (formData) => {
            const description = wysiwygController.current?.getStateAsString?.();
            const isValid = await form.trigger('description');
            if (!isValid) {
              toast.error('Описание дела содержит ошибки', { position: 'top-center' });
              return;
            }

            onSubmit?.({
              name: formData.name,
              weight: formData.weight,
              startDate: formData.startDate,
              deadline: formData.deadline,
              description,
              priority: formData.priority != null ? +formData.priority : TaskPriority.DELETE,
            });
          })(evt);
        }}
      >
        <SidebarProvider
          defaultOpen={defaultSidebarOpen}
          className="flex min-h-0 h-full min-w-0 flex-col"
        >
          <div className="grid grow grid-rows-[min-content_1fr_min-content] min-h-0 h-full">
            <TaskHeaderForm
              isCreate={!isEdit}
              beforeNameSlot={<TaskFormSidebarTrigger />}
              afterNameSlot={afterNameSlot}
              onCancel={() => void form.resetField('name', { defaultValue: task?.name })}
            />

            <div className="flex grow min-h-0 min-w-0 flex-1">
              <WysiwygForm<TaskFormData>
                name="description"
                placeholder="Опишите дело"
                editable={!isEdit}
                wysiwygController={wysiwygController}
                onDirtyChange={(isDirty) => {
                  form.setValue('isDescriptionDirty', isDirty, { shouldDirty: true });
                }}
              />

              <TaskFormSidebar
                footerSidebarSlot={footerSidebarSlot?.({ disabled: form.formState.disabled })}
              />
            </div>

            <div className="border-t p-4 flex items-center justify-end">
              {footerSlot != null && footerSlot?.({ disabled: form.formState.disabled })}

              <ButtonLoading
                form={formId}
                type="submit"
                isLoading={isLoading}
                disabled={!form.formState.isDirty || form.formState.disabled}
              >
                Сохранить
              </ButtonLoading>
            </div>
          </div>

          <SidebarErrorCatcher />

          <FormStateEmitter
            isLoading={isLoading}
            emitIsDirty={emitIsDirty}
            emitIsLoading={emitIsLoading}
          />
        </SidebarProvider>
      </form>
    </Form>
  );
}

function TaskForm(props: TaskFormProps) {
  return (
    <TaskFieldsRulesProvider status={props?.task?.status}>
      <Component {...props} />
    </TaskFieldsRulesProvider>
  );
}

export { TaskForm, type TaskFormProps };
