'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useInboxQuery } from '@/entity/planner/inbox';
import {
  TaskForm,
  TaskFormProvider,
  TaskSubmitFormData,
  useTaskCreate,
  useTaskFromContext,
} from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { AppDialog, useConfirmDialog } from '@/shared/project-ui';
import { Button, ButtonLoading } from '@/shared/ui-kit';

interface ComponentProps {
  readonly onSubmit: (taskFormData: TaskSubmitFormData, close: () => void) => MaybePromise<void>;
}

function Component({ onSubmit }: ComponentProps) {
  const [open, setOpen] = useState(false);
  const { viaConfirmation } = useConfirmDialog();
  const {
    resetToInit,
    formState: { isDirty },
  } = useTaskFromContext();
  const { data } = useInboxQuery();

  const close = () => {
    setOpen(false);
    resetToInit();
  };

  return (
    <AppDialog
      open={open}
      title="Создание дела"
      trigger={
        <Button type="button" disabled={data.id == null}>
          <Plus />
          Создать
        </Button>
      }
      content={<TaskForm className="px-4 py-2" onSubmit={(taskFormData) => void onSubmit(taskFormData, close)} />}
      footer={<Footer />}
      onOpenChange={(value) => {
        if (!value && isDirty) {
          viaConfirmation({
            isNeedConfirm: () => isDirty,
            callback: close,
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
        } else {
          if (value) {
            setOpen(true);
          } else {
            close();
          }
        }
      }}
    />
  );
}

function TaskCreationDialog(props: { groupId?: number; onSuccess: () => MaybePromise<void> }) {
  const { loading, createTask } = useTaskCreate();

  return (
    <TaskFormProvider loading={loading} fieldVisibility={{ groupSelection: false }}>
      <Component
        onSubmit={async (taskFormData, close) => {
          const { name, description, deadline, startDate, priority } = taskFormData;

          await createTask({
            variables: { input: { name, description, deadline, startDate, priority, groupId: props.groupId } },
            async onCompleted() {
              await props.onSuccess();
              close();
            },
          });
        }}
      />
    </TaskFormProvider>
  );
}

function Footer() {
  const { formId, formState } = useTaskFromContext();

  return (
    <div>
      <ButtonLoading form={formId} loading={formState.isLoading} disabled={formState.disabled} type="submit">
        Сохранить
      </ButtonLoading>
    </div>
  );
}

export { TaskCreationDialog };
