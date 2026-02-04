import { useInvalidateGroups } from '@/entity/planner/groups';
import { type TaskEntity, useTaskUnassignFromGroup } from '@/entity/planner/tasks';
import { TaskCreation } from '@/feature/planner/tasks/task-creation';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { ButtonAdd } from '@/shared/components/button-add';
import { ButtonClose } from '@/shared/components/button-close';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { Input } from '@/shared/ui-kit/ui/input';
import { useState } from 'react';
import { GroupTaskList } from './group-task-list';

interface GroupTaskListControllerProps {
  readonly groupId: number;
}

function GroupTaskListController({ groupId }: GroupTaskListControllerProps) {
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const [taskForUpdate, setTaskForUpdate] = useState<TaskEntity | null>(null);
  const { unassignTaskFromGroup, isPending } = useTaskUnassignFromGroup();
  const invalidateGroups = useInvalidateGroups();

  return (
    <>
      <GroupTaskList
        afterTaskNameSlot={({ taskId }) => {
          return (
            <ButtonClose
              size="xs"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                viaConfirmation({
                  isNeedConfirm: () => true,
                  callback: () =>
                    void unassignTaskFromGroup(
                      { params: { path: { taskId, groupId } } },
                      { onSuccess: invalidateGroups },
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
        beforeTaskListSlot={
          <div className="flex gap-2 mb-2">
            <Input placeholder="Найти дело?" />
            <TaskCreation groupId={groupId} trigger={<ButtonAdd />} />
          </div>
        }
        emptyPlaceholderBeforeEndSlot={
          <div>
            <TaskCreation
              groupId={groupId}
              trigger={
                <Button className="mt-2" size="sm" type="button" variant="outline">
                  Создать
                </Button>
              }
            />
          </div>
        }
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
