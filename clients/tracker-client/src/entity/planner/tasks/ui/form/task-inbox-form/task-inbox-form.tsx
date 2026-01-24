import { type TaskInboxEntity, TaskPriority } from '@/entity/planner/tasks';
import {
  FormStateEmitter,
  type FormStateEmitterProps,
  TextareaForm,
} from '@/shared/components/form';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { Form } from '@/shared/ui-kit/ui/form';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TaskHeaderForm } from '../task-header-form';
import { TaskFormInboxSidebar, TaskFormSidebarTrigger } from './components/task-form-inbox-sidebar';
import {
  type TaskInboxFormData,
  type TaskInboxSubmitFormData,
  validationSchema,
} from './validation-schema';

interface ThingManagerFormProps extends FormStateEmitterProps {
  readonly inboxTask?: Omit<TaskInboxEntity, 'id'>;
  readonly onSubmit: (data: {
    name: string;
    priority: number;
    deadline?: string;
    description?: string;
  }) => void;
}
function TaskInboxForm(props: ThingManagerFormProps) {
  const { inboxTask, isLoading, emitIsDirty, emitIsLoading, onSubmit } = props;

  const isEdit = inboxTask != null;
  const isMobile = useIsMobile();

  const values = isEdit
    ? {
        name: inboxTask.name,
        deadline: inboxTask.deadline != null ? new Date(inboxTask.deadline) : undefined,
        description: inboxTask.description,
        priority: inboxTask.priority?.toString(),
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
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="flex grow"
        onSubmit={form.handleSubmit((formData) => {
          onSubmit({
            name: formData.name,
            deadline: formData.deadline,
            description: formData.description,
            priority: formData.priority != null ? +formData.priority : TaskPriority.DELETE,
          });
        })}
      >
        <SidebarProvider defaultOpen={false} className="flex flex-col min-h-fit grow">
          <TaskHeaderForm
            mode={isEdit ? 'edit' : 'create'}
            beforeNameSlot={<TaskFormSidebarTrigger className="mr-3" />}
            onCancel={() => void form.resetField('name', { defaultValue: inboxTask?.name })}
          />

          <div className="flex flex-col grow gap-3 p-2 pt-0 sm:p-4 sm:pt-0">
            <div className="flex grow">
              <TextareaForm<TaskInboxFormData>
                name="description"
                placeholder="Опиши свое дело"
                tabIndex={isMobile ? -1 : undefined}
                classNames={{
                  wrapper: 'grow items-top grid-rows-[1fr]',
                  textarea: 'resize-none',
                }}
              />

              <TaskFormInboxSidebar />
            </div>

            <Button
              type="submit"
              className="ml-auto"
              disabled={!form.formState.isDirty || isLoading || form.formState.disabled}
            >
              {isLoading ? <AppLoader inverse size={20} /> : null}
              Сохранить
            </Button>
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
