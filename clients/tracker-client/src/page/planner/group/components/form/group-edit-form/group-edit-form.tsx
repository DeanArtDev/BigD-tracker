import type { GroupStatus } from '@/entity/planner/groups';
import { GroupStatusIndication } from '@/entity/planner/groups/ui';
import type { TaskEntity } from '@/entity/planner/tasks';
import { WysiwygForm } from '@/shared/components/form';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { Form } from '@/shared/ui-kit/ui/form';
import { Progress } from '@/shared/ui-kit/ui/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui-kit/ui/resizable';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GroupEditFormHeader } from './components/group-edit-form-header';
import { GroupTaskList } from './components/group-task-list';
import {
  type GroupEditFormData,
  type GroupEditSubmitFormData,
  validationSchema,
} from './validation-schema';
import { Typography } from '@/shared/components/typography';

interface GroupEditFormProps {
  readonly loading?: boolean;
  readonly footerSlot?: ReactNode;
  readonly group: {
    readonly name: string;
    readonly description?: string;
    readonly progress: number;
    readonly status: GroupStatus;
    readonly tasks: TaskEntity[];
  };

  readonly onSubmit: (formData: {
    readonly name: string;
    readonly description?: string;
    readonly tasks: GroupEditSubmitFormData['tasks'];
  }) => void;
}

function GroupEditForm({ loading, footerSlot, group, onSubmit }: GroupEditFormProps) {
  const form = useForm<GroupEditFormData, any, GroupEditSubmitFormData>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
    disabled: loading,
    values: {
      name: group.name,
      description: group.description,
      isDescriptionDirty: false,
      tasks: tasksConvert(group.tasks),
    },
  });

  const wysiwygController = useRef<{ readonly getStateAsString?: () => string } | null>(null);
  const isMobile = useIsMobile();
  const orientation = isMobile ? 'vertical' : 'horizontal';

  useEffect(() => {
    form.reset({
      name: group.name,
      description: group.description,
      tasks: tasksConvert(group.tasks),
      isDescriptionDirty: false,
    });
  }, [group]);

  return (
    <Form {...form}>
      <form className="group-edit flex flex-col min-h-0 min-w-0 grow">
        <GroupEditFormHeader
          onCancel={() => void form.resetField('name', { defaultValue: group.name })}
        />

        <div className="flex gap-2 items-center mb-3 ">
          <Progress value={group.progress} className="w-full" />

          {[0, 100].includes(group.progress) ? (
            <GroupStatusIndication status={group.status} />
          ) : (
            <Typography.Small>{group.progress}%</Typography.Small>
          )}
        </div>

        <ResizablePanelGroup
          className="resize-panel-group relative grow min-h-0 min-w-0"
          orientation={orientation}
        >
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
            defaultSize={isMobile ? 0 : 210}
            className="mt-3 md:mt-0 flex min-h-0 min-w-0 grow"
          >
            <GroupTaskList />
          </ResizablePanel>
        </ResizablePanelGroup>

        <Separator />

        <div className="footer flex p-2.5 lg:p-0 lg:pt-3">
          {footerSlot}

          <Button
            className="ml-auto"
            disabled={form.formState.disabled || !form.formState.isDirty}
            type="submit"
            onClick={form.handleSubmit(async (formData) => {
              const description = wysiwygController.current?.getStateAsString?.();
              const isValid = await form.trigger('description');
              if (!isValid) {
                toast.error('Описание содержит ошибки', { position: 'top-center' });
                return;
              }

              onSubmit({ name: formData.name, description, tasks: formData.tasks });
            })}
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
