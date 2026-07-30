'use client';

import { GroupId } from '@/entity/planner/groups';
import { MaybePromise } from '@/shared/lib';
import { AppDialog } from '@/shared/project-ui';
import { TaskRecoveryDialogContent } from './task-recovery-dialog-content';

interface TaskRecoveryDialogProps {
  readonly open: boolean;
  readonly loading?: boolean;

  readonly onOpenChange: (value: boolean) => void;
  readonly onRecover: (groupId: GroupId) => MaybePromise<void>;
}

function TaskRecoveryDialog({ open, loading = false, onOpenChange, onRecover }: TaskRecoveryDialogProps) {
  return (
    <AppDialog
      open={open}
      verticalScroll={false}
      className="sm:max-w-120 [&_[data-slot=dialog-header]]:border-b-0"
      title="Восстановить дело"
      description="Выбери расположение для дела"
      onOpenChange={(value) => {
        if (loading) return;
        onOpenChange?.(value);
      }}
      content={
        <TaskRecoveryDialogContent loading={loading} onCancel={() => void onOpenChange(false)} onRecover={onRecover} />
      }
    />
  );
}

export { TaskRecoveryDialog, type TaskRecoveryDialogProps };
