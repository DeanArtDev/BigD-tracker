'use client';

import type { ICalendarApp } from '@dayflow/core';
import type { KeyboardShortcutsService } from '@dayflow/plugin-keyboard-shortcuts';
import { type ReactNode, useEffect } from 'react';
import { DefaultValues } from 'react-hook-form';
import { GroupId, GroupLabelBadge } from '@/entity/planner/groups';
import {
  Task,
  TaskForm,
  TaskFormData,
  TaskFormFieldProvider,
  TaskFormFooter,
  TaskFormProvider,
  TaskSubmitFormData,
  useTaskFromContext,
} from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { AppDialog, useConfirmDialog } from '@/shared/project-ui';

interface DiaryEventDialogContentProps {
  readonly open: boolean;
  readonly title: ReactNode;
  readonly onAnimationEnd: () => void;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (taskFormData: TaskSubmitFormData<GroupId>) => MaybePromise<void>;
}

function DiaryEventDialogContent({
  open,
  title,
  onAnimationEnd,
  onOpenChange,
  onSubmit,
}: DiaryEventDialogContentProps) {
  const { viaConfirmation } = useConfirmDialog();
  const {
    getValues,
    formState: { isDirty },
  } = useTaskFromContext();

  return (
    <AppDialog
      open={open}
      title={title}
      contentProps={{
        onAnimationEnd: (event) => {
          if (event.target === event.currentTarget && event.currentTarget.dataset.state === 'closed') {
            onAnimationEnd();
          }
        },
      }}
      content={
        <TaskForm<GroupId>
          className="p-3"
          groupSlot={<GroupLabelBadge groupId={getValues('groupId') as GroupId} />}
          onSubmit={onSubmit}
        />
      }
      footer={<TaskFormFooter />}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isDirty) {
          viaConfirmation({
            isNeedConfirm: () => isDirty,
            callback: () => onOpenChange(false),
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
          return;
        }

        onOpenChange(nextOpen);
      }}
    />
  );
}

interface DiaryEventDialogProps {
  readonly app?: ICalendarApp;
  readonly open: boolean;
  readonly task?: Task<GroupId>;
  readonly title: ReactNode;
  readonly defaultValues?: DefaultValues<TaskFormData<GroupId>>;
  readonly onAnimationEnd: () => void;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: DiaryEventDialogContentProps['onSubmit'];
}

function DiaryEventDialog({
  app,
  open,
  task,
  title,
  defaultValues,
  onAnimationEnd,
  onOpenChange,
  onSubmit,
}: DiaryEventDialogProps) {
  useEffect(() => {
    const keyboardShortcuts = app?.getPlugin<KeyboardShortcutsService>('keyboard-shortcuts');
    const wasEnabled = keyboardShortcuts?.isEnabled() ?? false;

    keyboardShortcuts?.disable();

    return () => {
      if (wasEnabled) keyboardShortcuts?.enable();
    };
  }, [app]);

  return (
    <TaskFormProvider<GroupId> task={task} defaultValues={defaultValues}>
      <TaskFormFieldProvider
        taskStatus={task?.status}
        defaultFieldsState={{ startDate: { clearable: false }, deadline: { clearable: false } }}
        blockState={{ params: { collapsed: false } }}
      >
        <DiaryEventDialogContent
          open={open}
          title={title}
          onAnimationEnd={onAnimationEnd}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      </TaskFormFieldProvider>
    </TaskFormProvider>
  );
}

export { DiaryEventDialog, type DiaryEventDialogProps };
