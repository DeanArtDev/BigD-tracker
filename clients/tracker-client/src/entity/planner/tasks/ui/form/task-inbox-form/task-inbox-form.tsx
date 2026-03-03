import { ButtonLoading } from '@/shared/components/button-loading';
import {
  FormStateEmitter,
  type FormStateEmitterProps,
  WysiwygForm,
} from '@/shared/components/form';
import { Form } from '@/shared/ui-kit/ui/form';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';
import { useWysiwygController } from '@/shared/ui-kit/ui/wysiwyg';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { TaskPriority } from '../../../lib/constants';
import type { TaskInboxEntity } from '../../../model';
import { TaskHeaderForm } from '../task-header-form';
import { TaskFormSidebarTrigger } from '../task-sidebar-root-form';
import { TaskFormInboxSidebar } from './components/task-form-inbox-sidebar';
import {
  type TaskInboxFormData,
  type TaskInboxSubmitFormData,
  validationSchema,
} from './validation-schema';

interface TaskInboxFormProps extends FormStateEmitterProps {
  readonly inboxTask?: Omit<TaskInboxEntity, 'id'>;
  readonly afterNameSlot?: ReactNode;
  readonly footerSidebarSlot?: ReactNode | ((props: { disabled: boolean }) => ReactNode);
  readonly onSubmit?: (data: {
    name: string;
    priority: number;
    deadline?: string;
    description?: string;
  }) => void;
}

function TaskInboxForm(props: TaskInboxFormProps) {
  const {
    inboxTask,
    isLoading = false,
    emitIsDirty,
    emitIsLoading,
    afterNameSlot,
    footerSidebarSlot,
    onSubmit,
  } = props;

  const isEdit = inboxTask != null;

  const values = isEdit
    ? {
        name: inboxTask.name,
        deadline: inboxTask.deadline != null ? new Date(inboxTask.deadline) : undefined,
        description: inboxTask.description,
        priority: inboxTask.priority?.toString(),
        isDescriptionDirty: false,
      }
    : undefined;

  const form = useForm<TaskInboxFormData, any, TaskInboxSubmitFormData>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
    disabled: isLoading,
    values,
    defaultValues: {
      name: undefined,
      deadline: undefined,
      description: undefined,
      priority: TaskPriority.DELETE.toString(),
      isDescriptionDirty: false,
    },
  });

  const { wysiwygController } = useWysiwygController();

  return (
    <Form {...form}>
      <form
        noValidate
        className="flex grow min-h-0 h-full flex-col"
        onSubmit={form.handleSubmit(async (formData) => {
          const description = wysiwygController.current?.getStateAsString?.();
          const isValid = await form.trigger('description');
          if (!isValid) {
            toast.error('Описание дела содержит ошибки', {
              position: 'top-center',
            });
            return;
          }

          onSubmit?.({
            name: formData.name,
            deadline: formData.deadline,
            description,
            priority: formData.priority != null ? +formData.priority : TaskPriority.DELETE,
          });
        })}
      >
        <SidebarProvider defaultOpen={false} className="flex min-h-0 h-full min-w-0 flex-col">
          <div className="grid grow grid-rows-[min-content_1fr_min-content] min-h-0 h-full">
            <TaskHeaderForm
              isCreate={!isEdit}
              afterNameSlot={afterNameSlot}
              beforeNameSlot={<TaskFormSidebarTrigger />}
              onCancel={() => void form.resetField('name', { defaultValue: inboxTask?.name })}
            />

            <div className="flex grow min-h-0 min-w-0 flex-1">
              <WysiwygForm<TaskInboxFormData>
                name="description"
                placeholder="Опишите дело"
                editable={!isEdit}
                wysiwygController={wysiwygController}
                onDirtyChange={(isDirty) => {
                  form.setValue('isDescriptionDirty', isDirty, { shouldDirty: true });
                }}
              />

              <TaskFormInboxSidebar footerSlot={footerSidebarSlot} />
            </div>

            <div className="border-t p-4 flex items-center justify-end">
              <ButtonLoading
                type="submit"
                isLoading={isLoading}
                disabled={!form.formState.isDirty || form.formState.disabled}
              >
                Сохранить
              </ButtonLoading>
            </div>
          </div>

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

export { TaskInboxForm, type TaskInboxFormProps };
