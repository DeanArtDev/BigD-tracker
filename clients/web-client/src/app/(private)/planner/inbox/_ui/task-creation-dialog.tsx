'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  TaskForm,
  TaskFormProvider,
  TaskSubmitFormData,
  useTaskCreate,
  useTaskFromContext,
} from '@/entity/planner/tasks';
import { MaybePromise, useConfirmDialog } from '@/shared/lib';
import { AppDialog } from '@/shared/project-ui';
import { Button, ButtonLoading } from '@/shared/ui-kit';

interface ComponentProps {
  readonly onSubmit: (taskFormData: TaskSubmitFormData, close: () => void) => MaybePromise<void>;
}

function Component({ onSubmit }: ComponentProps) {
  const [open, setOpen] = useState(false);
  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const {
    formState: { isDirty },
  } = useTaskFromContext();

  return (
    <>
      <AppDialog
        open={open}
        title="Создание дела"
        trigger={
          <Button type="button">
            <Plus />
            Создать
          </Button>
        }
        content={
          <TaskForm
            className="px-4 py-2"
            onSubmit={(taskFormData) => void onSubmit(taskFormData, () => void setOpen(false))}
          />
        }
        footer={<Footer />}
        onOpenChange={(value) => {
          if (!value && isDirty) {
            viaConfirmation({
              isNeedConfirm: () => isDirty,
              callback: () => void setOpen(value),
              dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
            });
          } else {
            setOpen(value);
          }
        }}
      />

      {confirmHolder}
    </>
  );
}

function TaskCreationDialog(props: { groupId?: number; onSuccess: () => MaybePromise<void> }) {
  const { loading, createTask } = useTaskCreate();

  return (
    <TaskFormProvider loading={loading} fieldVisibility={{ groupSelection: false }}>
      <Component
        onSubmit={async (taskFormData, close) => {
          await createTask({
            variables: { input: { ...taskFormData, groupId: props.groupId } },
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
