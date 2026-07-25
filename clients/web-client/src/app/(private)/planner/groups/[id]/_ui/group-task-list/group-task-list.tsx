'use client';

import { useRef, useState } from 'react';
import { GroupCacheManager, GroupId } from '@/entity/planner/groups';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { useTaskUnassignFromGroup } from '@/feature/planner/task-unassign-from-group';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { DataLoader, ScrollAreaNativeVertical } from '@/shared/ui-kit';
import { EmptyTasksElement } from './empty-tasks-element';
import { GroupTaskListForm } from './group-task-list-form';
import { GroupTaskListHeader } from './group-task-list-header';
import { DetailedGroupTask, useGetDetailedGroup } from '../../_api';

interface GroupTaskListProps {
  readonly groupId: GroupId;
}

function GroupTaskList({ groupId }: GroupTaskListProps) {
  const { group, tasks, initialLoading, isEmptyTasks, isError, refetch } = useGetDetailedGroup({ groupId });
  const { openTaskUpdate } = useTaskUpdateContext();

  const { updateGroup } = useGroupUpdateFeature();
  const { unassignTaskFromGroup, client } = useTaskUnassignFromGroup();
  const [targetTask, setTargetTask] = useState<DetailedGroupTask | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col h-full border-2 min-w-0 min-h-0 rounded-xl">
      <GroupTaskListHeader groupId={groupId} />

      <DataLoader
        isLoading={initialLoading}
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
                onContentClick={(task) => void openTaskUpdate(task)}
                onHeaderClick={() => void console.log('header click')}
                onUnassign={(task) => {
                  setTargetTask(task);
                  unassignTaskFromGroup(
                    { taskId: task.id, groupId },
                    {
                      onSuccess: () => {
                        GroupCacheManager.removeGroupTask(client.cache, { groupId, taskId: task.id });
                        GroupCacheManager.changeGroupTaskCount(client.cache, { groupId, delta: -1 });
                      },
                    },
                  ).finally(() => void setTargetTask(null));
                }}
                onTasksUpdate={(ids) => {
                  if (group != null) {
                    updateGroup({
                      id: group.id,
                      name: group.name,
                      description: group.description ?? undefined,
                      taskIds: ids,
                    });
                  }
                }}
              />
            </div>
          </ul>
        </ScrollAreaNativeVertical>
      </DataLoader>
    </div>
  );
}

export { GroupTaskList, type GroupTaskListProps };
