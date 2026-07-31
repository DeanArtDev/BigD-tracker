import { FolderOutput } from 'lucide-react';
import { useState } from 'react';
import { GroupListDropdown, GroupTaskIndication, useGroupListDrawerContext } from '@/entity/planner/groups';
import { TaskActionType, TaskDomain, TaskId, TaskList } from '@/entity/planner/tasks';
import { TaskRecoveryDialog } from '@/feature/planner/task-recovery';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { AppTooltip } from '@/shared/project-ui';
import { Button, DataLoader } from '@/shared/ui-kit';
import { useTaskActionsFeature } from '@/widget/planner/task-actions';
import { useGetTasksPerPageDeleted } from '../../_model/use-get-tasks-per-page-deleted';

function TaskListDeleted() {
  const {
    tasks,
    refetch,
    meta,
    isError,
    initialLoading,
    isEmpty,
    loading: isTasksPerPageLoading,
    fetchMore,
  } = useGetTasksPerPageDeleted();
  const { openTaskUpdate } = useTaskUpdateContext();
  const { openGroupList } = useGroupListDrawerContext();

  const [open, setOpen] = useState(false);
  const [recoveryTaskData, setRecoveryTaskData] = useState<{ taskId: TaskId }>();

  const {
    taskRecoveryHandler,
    taskCompleteDeleteHandler,
    taskCloneHandler,
    taskAssignHandler,
    taskFinishDialogHolder,
    isActionLoading,
  } = useTaskActionsFeature();

  return (
    <>
      <TaskList
        tasks={tasks}
        onRetry={refetch}
        virtualizerProps={{
          className: 'h-full',
          isError,
          hasNextPage: meta?.nextPage ?? false,
          isLoadingNextPage: isTasksPerPageLoading,
          onNextPageLoad: fetchMore,
          virtualizerOptions: {
            count: tasks.length,
            estimateSize: () => 84,
            gap: 10,
          },
        }}
        dataLoaderProps={{
          isLoading: initialLoading,
          isEmpty,
          emptyElement: <DataLoader.Empty title="Дел пока нет" />,
        }}
        menuProps={{
          loading: isActionLoading,
          onClone: (task) => void taskCloneHandler(task.id),
          onDeleteComplete: (task) => void taskCompleteDeleteHandler(task.id, { showToast: false }),
          onRecover: (task) => {
            setOpen(true);
            setRecoveryTaskData({ taskId: task.id });
          },

          onAssign: (task) => {
            openGroupList({
              selectedGroupIds: task.groupId != null ? [task.groupId] : [],
              cb: async (group) => {
                if (task.groupId != group.id) {
                  taskAssignHandler({ groupId: group.id, task });
                }
              },
            });
          },
        }}
        slots={{
          beforeCardBottomRowSlot: (task) => <GroupTaskIndication className="ml-2" groupId={task.groupId} />,
          beforeCardMenuSlot: (task) => {
            const isAllowAssign = TaskDomain.isAllowTaskAction(
              TaskActionType.Assign,
              task.status,
              TaskDomain.parseId(task.id).type,
            );

            if (!isAllowAssign) return null;
            return (
              <GroupListDropdown
                selectedGroupId={task.groupId}
                trigger={
                  <Button size="icon-sm" variant="ghost" disabled={isActionLoading}>
                    <AppTooltip content="Переместить в группу" delayDuration={2000} asChild>
                      <FolderOutput />
                    </AppTooltip>
                  </Button>
                }
                onSelect={(groupInfo) => void taskAssignHandler({ groupId: groupInfo.id, task })}
              />
            );
          },
        }}
        onTaskContentClick={openTaskUpdate}
      />

      {taskFinishDialogHolder}

      <TaskRecoveryDialog
        open={open}
        onOpenChange={setOpen}
        loading={isActionLoading}
        onRecover={async (groupId) => {
          if (recoveryTaskData == null) return;
          await taskRecoveryHandler({ taskId: recoveryTaskData?.taskId, groupId });
          setOpen(false);
        }}
      />
    </>
  );
}

export { TaskListDeleted };
