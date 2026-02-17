import { useInvalidateGroupById, useInvalidateGroups } from '@/entity/planner/groups';
import {
  type TaskEntity,
  useAssignTaskToGroup,
  useUnassignTaskFromGroup,
} from '@/entity/planner/tasks';
import { isAllowTaskAction } from '@/entity/planner/tasks/lib';
import { TaskCreation } from '@/feature/planner/tasks/task-creation';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { ButtonAdd } from '@/shared/components/button-add';
import { ButtonClose } from '@/shared/components/button-close';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { GroupTaskAutocomplete } from './group-task-autocomplete';
import { GroupTaskList } from './group-task-list';

interface GroupTaskListControllerProps {
  readonly groupId: number;
}

function GroupTaskListController({ groupId }: GroupTaskListControllerProps) {
  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const { formState } = useFormContext();

  const [taskForUpdate, setTaskForUpdate] = useState<TaskEntity | null>(null);

  const { unassignTaskFromGroup, isPending } = useUnassignTaskFromGroup();
  const { assignTaskToGroup, isPending: isAssignTaskToGroupPending } = useAssignTaskToGroup();

  const invalidateGroups = useInvalidateGroups();
  const invalidateGroupById = useInvalidateGroupById();
  const invalidate = async () => {
    await invalidateGroups();
    await invalidateGroupById({ groupId });
  };

  const TaskAutocomplete = (
    <div className="flex gap-2 mb-2">
      <GroupTaskAutocomplete
        disabled={formState.disabled}
        loading={isAssignTaskToGroupPending}
        onTaskSelect={(taskId) => {
          assignTaskToGroup({ params: { path: { taskId, groupId } } }, { onSuccess: invalidate });
        }}
      />

      <TaskCreation groupId={groupId} trigger={<ButtonAdd />} onSuccess={invalidate} />
    </div>
  );

  return (
    <>
      <GroupTaskList
        afterTaskNameSlot={({ taskInfo: { status, id: taskId } }) => {
          if (!isAllowTaskAction('UNASSIGN', status)) return null;

          return (
            <ButtonClose
              className="size-5"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                viaConfirmation({
                  isNeedConfirm: () => true,
                  callback: () =>
                    void unassignTaskFromGroup(
                      { params: { path: { taskId, groupId } } },
                      { onSuccess: invalidate },
                    ),

                  dialog: {
                    title: 'Удалить дело из группы?',
                    content: 'Дело можно будет добавить в группу повторно',
                  },
                });
              }}
            />
          );
        }}
        beforeTaskListSlot={TaskAutocomplete}
        emptyPlaceholderBeforeEndSlot={TaskAutocomplete}
        onTaskClick={(formTask) =>
          void setTaskForUpdate({
            id: formTask.id,
            priority: Number(formTask.priority),
            description: formTask.description,
            name: formTask.name,
            deadline: formTask.deadline ?? undefined,
            recurrence: formTask.recurrence,
            startDate: formTask.startDate ?? undefined,
            weight: formTask.weight,
            status: formTask.status,
          })
        }
      />

      <TaskEdit
        task={taskForUpdate}
        groupId={groupId}
        onCansel={() => void setTaskForUpdate(null)}
        onSuccess={() => void setTaskForUpdate(null)}
      />

      {confirmHolder}
    </>
  );
}

export { GroupTaskListController, type GroupTaskListControllerProps };
