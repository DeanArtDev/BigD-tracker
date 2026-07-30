'use client';

import { useRef, useState } from 'react';
import { GroupId, useGroupListDrawerContext } from '@/entity/planner/groups';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { DataLoader, ScrollAreaNativeVertical } from '@/shared/ui-kit';
import { useTaskActionsFeature } from '@/widget/planner/task-actions';
import { EmptyTasksElement } from './empty-tasks-element';
import { GroupTaskListForm } from './group-task-list-form';
import { GroupTaskListHeader } from './group-task-list-header';
import { DetailedGroupTask, useGetDetailedGroupSuspense } from '../../_api';

interface GroupTaskListProps {
  readonly groupId: GroupId;
}

function GroupTaskList({ groupId }: GroupTaskListProps) {
  const { group, tasks, isEmptyTasks, isError, refetch } = useGetDetailedGroupSuspense({ groupId });
  const { openTaskUpdate } = useTaskUpdateContext();

  const { updateGroup } = useGroupUpdateFeature();
  const { openGroupList } = useGroupListDrawerContext();

  const {
    taskFinishDialogHolder,
    taskFinishHandler,
    taskUnassignHandler,
    taskDeleteHandler,
    taskAssignHandler,
    taskCloneHandler,
  } = useTaskActionsFeature();
  const [targetTask, setTargetTask] = useState<DetailedGroupTask | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col h-full border-2 min-w-0 min-h-0 rounded-xl">
      <GroupTaskListHeader groupId={groupId} />

      <DataLoader
        isEmpty={isEmptyTasks}
        isError={isError}
        errorElement={<DataLoader.Error className="grow" onRetry={refetch} />}
        emptyElement={<EmptyTasksElement groupId={groupId} />}
      >
        <ScrollAreaNativeVertical className="grow" ref={containerRef}>
          <ul className="flex grow flex-col h-full">
            <div className="p-3">
              <GroupTaskListForm
                tasks={tasks}
                loadingTaskId={targetTask?.id}
                onHeaderClick={() => void console.log('Header clicked')}
                onDelete={(task) => {
                  setTargetTask(task);
                  taskDeleteHandler(
                    { groupId: task?.groupId, taskId: task.id },
                    { onSuccess: () => void setTargetTask(null), onCancel: () => void setTargetTask(null) },
                  );
                }}
                onFinish={async (task) => {
                  setTargetTask(task);
                  taskFinishHandler(task.id, () => void setTargetTask(null));
                }}
                onAssign={(task) =>
                  void openGroupList({
                    selectedGroupIds: [groupId],
                    cb: async (group) => {
                      if (task.groupId != group.id) {
                        setTargetTask(task);
                        await taskAssignHandler({ groupId: group.id, task });
                        setTargetTask(null);
                      }
                    },
                  })
                }
                onClone={(task) => void taskCloneHandler(task.id)}
                onContentClick={(task) => void openTaskUpdate(task)}
                onUnassign={async (task) => {
                  setTargetTask(task);
                  await taskUnassignHandler({ taskId: task.id, groupId });
                  setTargetTask(null);
                }}
                onTasksOrderUpdate={(ids) => {
                  if (group != null) {
                    updateGroup({
                      id: group.id,
                      name: group.name,
                      taskIds: ids,
                      description: undefined,
                    });
                  }
                }}
              />
            </div>
          </ul>
        </ScrollAreaNativeVertical>
      </DataLoader>

      {taskFinishDialogHolder}
    </div>
  );
}

export { GroupTaskList, type GroupTaskListProps };
