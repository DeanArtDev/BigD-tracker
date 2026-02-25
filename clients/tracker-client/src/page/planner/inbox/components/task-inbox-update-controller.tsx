import { useInvalidateAllGroups, useInvalidateInbox } from '@/entity/planner/groups';
import { AssignInboxTaskToGroupDialog } from '@/entity/planner/groups/ui';
import {
  type TaskInboxEntity,
  useAssignTaskToGroup,
  useInvalidateAllTasks,
} from '@/entity/planner/tasks';
import { useUpdateInboxTask } from '@/entity/planner/tasks/model';
import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog, AppDialogTrigger } from '@/shared/ui-kit/ui/app-dialog';

const TaskInboxFormLazy = withLazy(() =>
  import('@/entity/planner/tasks/ui/form').then((m) => ({ default: m.TaskInboxForm })),
);

interface TaskInboxUpdateControllerProps {
  readonly inboxTask?: TaskInboxEntity;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

function TaskInboxUpdateController({
  inboxTask,
  onCancel,
  onSuccess,
}: TaskInboxUpdateControllerProps) {
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const open = inboxTask != null;

  const { updateInboxTask, isPending: isInboxTaskUpdatePending } = useUpdateInboxTask();
  const invalidateInbox = useInvalidateInbox();
  const invalidateDiaryTasks = useInvalidateAllTasks();
  const invalidateAllGroups = useInvalidateAllGroups();
  const { assignTaskToGroup, isPending: isAssignTaskToGroupPending } = useAssignTaskToGroup();

  return (
    <>
      <AppDialog
        modal={false}
        open={open}
        className="sm:h-full sm:max-h-[60vh] p-0 sm:p-0"
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;

          viaConfirmation({
            isNeedConfirm: () => formEmitterState.isDirty && !value,
            callback: () => void onCancel?.(),
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
        }}
      >
        <TaskInboxFormLazy
          inboxTask={inboxTask}
          isLoading={isInboxTaskUpdatePending}
          {...formStateEmitterProps}
          afterNameSlot={<AppDialogTrigger />}
          footerSidebarSlot={
            <div className="ml-auto">
              <AssignInboxTaskToGroupDialog
                taskGroupId={inboxTask?.groupId}
                loading={isAssignTaskToGroupPending}
                onSelect={(groupInfo, close) => {
                  if (inboxTask == null) return;

                  assignTaskToGroup(
                    { params: { path: { taskId: inboxTask.id, groupId: groupInfo.id } } },
                    {
                      onSuccess: async () => {
                        await invalidateInbox();
                        await invalidateAllGroups();
                        close();
                        onCancel?.();
                      },
                    },
                  );
                }}
              />
            </div>
          }
          onSubmit={(formResult) => {
            if (inboxTask == null) return;

            updateInboxTask(
              {
                params: { path: { taskId: inboxTask.id } },
                body: { data: formResult },
              },
              {
                onSuccess: async () => {
                  await invalidateDiaryTasks();
                  await invalidateInbox();
                  onSuccess?.();
                },
              },
            );
          }}
        />
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { TaskInboxUpdateController };
