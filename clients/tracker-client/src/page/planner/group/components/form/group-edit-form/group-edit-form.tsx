import type { GroupEntity } from '@/entity/planner/groups';
import { GroupStatusIndication } from '@/entity/planner/groups/ui';
import type { TaskEntity } from '@/entity/planner/tasks';
import { WysiwygForm } from '@/shared/components/form';
import { Typography } from '@/shared/components/typography';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { Form } from '@/shared/ui-kit/ui/form';
import { Progress } from '@/shared/ui-kit/ui/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui-kit/ui/resizable';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { useWysiwygController } from '@/shared/ui-kit/ui/wysiwyg';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useId } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GroupEditFormHeader } from './components/group-edit-form-header';
import { GroupTaskListController } from './components/group-task-list-controller';
import { type GroupEditFormData, type GroupEditSubmitFormData, validationSchema } from './validation-schema';

interface GroupEditFormProps {
  readonly loading?: boolean;
  readonly footerSlot?: ReactNode;
  readonly group: GroupEntity;

  readonly onSubmit: (
    formData: {
      readonly name: string;
      readonly description?: string;
      readonly tasks: GroupEditSubmitFormData['tasks'];
    },
    params: { reset: () => void },
  ) => void;
}

function GroupEditForm({ loading, footerSlot, group, onSubmit }: GroupEditFormProps) {
  const formId = useId();

  const values = {
    name: group.name,
    description: group.description,
    tasks: tasksConvert(group.tasks),
    isDescriptionDirty: false,
  };

  const form = useForm<GroupEditFormData, any, GroupEditSubmitFormData>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
    disabled: loading,
    values,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const { wysiwygController } = useWysiwygController();
  const isMobile = useIsMobile();
  const orientation = isMobile ? 'vertical' : 'horizontal';

  return (
    <Form {...form}>
      <form
        id={formId}
        className="group-edit flex flex-col min-h-0 min-w-0 grow"
        onSubmit={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();

          form.handleSubmit(async (formData) => {
            const description = wysiwygController.current?.getStateAsString?.();
            const isValid = await form.trigger('description');
            if (!isValid) {
              toast.error('Описание содержит ошибки', { position: 'top-center' });
              return;
            }
            const response = { name: formData.name, description, tasks: formData.tasks };

            onSubmit(response, {
              reset: () =>
                void form.reset(
                  { ...response, isDescriptionDirty: false },
                  { keepDirty: false, keepDirtyValues: false, keepValues: false },
                ),
            });
          })(evt);
        }}
      >
        <GroupEditFormHeader onCancel={() => void form.resetField('name', { defaultValue: group.name })} />

        <div className="flex gap-2 items-center mb-3">
          <Progress value={group.progress} className="w-full bg-primary/30" />

          {[0, 100].includes(group.progress) ? (
            <GroupStatusIndication status={group.status} />
          ) : (
            <Typography.Small>{group.progress}%</Typography.Small>
          )}
        </div>

        <ResizablePanelGroup className="resize-panel-group relative grow min-h-0 min-w-0" orientation={orientation}>
          <ResizablePanel
            className="flex min-h-0 min-w-0 grow"
            defaultValue="75%"
            minSize={isMobile ? undefined : '60%'}
          >
            <WysiwygForm<GroupEditFormData>
              name="description"
              classNames={{ wrapper: 'h-full md:h-auto' }}
              editable={false}
              placeholder="Опишите дело"
              wysiwygController={wysiwygController}
              onDirtyChange={(isDirty) => {
                form.setValue('isDescriptionDirty', isDirty, { shouldDirty: true });
              }}
            />
          </ResizablePanel>

          <ResizableHandle className="resize-handle" withHandle />

          <ResizablePanel
            collapsible
            minSize={isMobile ? undefined : 200}
            defaultSize={isMobile ? 0 : '25%'}
            className="mt-3 md:mt-0 flex min-h-0 min-w-0 grow"
          >
            <GroupTaskListController groupId={group.id} />
          </ResizablePanel>
        </ResizablePanelGroup>

        <Separator />

        <div className="footer flex p-2.5 lg:p-0 lg:pt-3">
          {footerSlot}

          <Button
            form={formId}
            className="ml-auto"
            disabled={form.formState.disabled || !form.formState.isDirty}
            type="submit"
          >
            Сохранить
          </Button>
        </div>
      </form>
    </Form>
  );
}

function tasksConvert(tasks: TaskEntity[]) {
  return tasks.map((task) => ({ ...task, priority: task.priority.toString() }));
}

export { GroupEditForm, type GroupEditFormProps };
