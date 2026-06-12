'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { TaskForm, TaskFormProvider, TaskSubmitFormData, useTaskFromContext } from '@/entity/planner/tasks';
import { MaybePromise, useConfirmDialog } from '@/shared/lib';
import { AppDialog } from '@/shared/project-ui';
import { Button } from '@/shared/ui-kit';

interface ComponentProps {
  readonly onSubmit: (taskFormData: TaskSubmitFormData) => MaybePromise<void>;
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
        content={<TaskForm className="px-4 py-2" onSubmit={console.log} />}
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

function TaskCreationDialog() {
  return (
    <TaskFormProvider>
      <Component onSubmit={console.log} />
    </TaskFormProvider>
  );
}

function Footer() {
  const { formId } = useTaskFromContext();

  return (
    <div>
      <Button form={formId} type="submit">
        Сохранить
      </Button>
    </div>
  );
}

export { TaskCreationDialog };
