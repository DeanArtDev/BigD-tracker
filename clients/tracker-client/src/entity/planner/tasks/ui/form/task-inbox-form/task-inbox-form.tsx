import { FormStateEmitter, type FormStateEmitterProps } from '@/shared/components/form';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { Form } from '@/shared/ui-kit/ui/form';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { TaskPriority } from '../../../lib/constants';
import type { TaskInboxEntity } from '../../../model';
import { TaskHeaderForm } from '../task-header-form';
import { TaskWysiwygForm } from '../task-wysiwyg-form';
import { TaskFormInboxSidebar, TaskFormSidebarTrigger } from './components/task-form-inbox-sidebar';
import {
  type TaskInboxFormData,
  type TaskInboxSubmitFormData,
  validationSchema,
} from './validation-schema';

interface ThingManagerFormProps extends FormStateEmitterProps {
  readonly inboxTask?: Omit<TaskInboxEntity, 'id'>;
  readonly afterNameSlot?: ReactNode;
  readonly onSubmit?: (data: {
    name: string;
    priority: number;
    deadline?: string;
    description?: string;
  }) => void;
}

/**TODO:
 * [x] логика dirty
 * [x] сохранение в базу
 * [] убрать санитайзер
 * [x] чекбоксы
 * [] списки
 *
 * */
function TaskInboxForm(props: ThingManagerFormProps) {
  const { inboxTask, isLoading, emitIsDirty, emitIsLoading, afterNameSlot, onSubmit } = props;

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

  const wysiwygController = useRef<{ readonly getStateAsString?: () => string } | null>(null);

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
              mode={isEdit ? 'edit' : 'create'}
              beforeNameSlot={<TaskFormSidebarTrigger />}
              afterNameSlot={afterNameSlot}
              onCancel={() => void form.resetField('name', { defaultValue: inboxTask?.name })}
            />

            <div className="flex grow min-h-0 min-w-0 flex-1">
              <TaskWysiwygForm<TaskInboxFormData>
                name="description"
                placeholder="Опишите дело"
                editable={!isEdit}
                wysiwygController={wysiwygController}
                onDirtyChange={(isDirty) => {
                  form.setValue('isDescriptionDirty', isDirty, { shouldDirty: true });
                }}
              />

              <TaskFormInboxSidebar />
            </div>

            <div className="border-t p-4 flex items-center justify-end">
              <Button
                type="submit"
                disabled={!form.formState.isDirty || isLoading || form.formState.disabled}
              >
                {isLoading ? <AppLoader inverse size={20} /> : null}
                Сохранить
              </Button>
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

export { TaskInboxForm, type ThingManagerFormProps };
