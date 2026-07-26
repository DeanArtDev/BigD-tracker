'use client';

import { useRef, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { useTaskUnassignFromGroup } from '@/feature/planner/task-unassign-from-group';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { GroupCacheManager } from '@/shared/transport/graphql';
import { DataLoader, ScrollAreaNativeVertical } from '@/shared/ui-kit';
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
  const { unassignTaskFromGroup, client, loading: isTaskUnassignLoading } = useTaskUnassignFromGroup();
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
                onContentClick={(task) => void openTaskUpdate(task)}
                onHeaderClick={() => void console.log('header click')}
                onUnassign={(task) => {
                  if (isTaskUnassignLoading) return;
                  setTargetTask(task);
                  unassignTaskFromGroup(
                    { taskId: task.id, groupId },
                    {
                      onSuccess: () => {
                        GroupCacheManager.refetchGroupTasks(client, { groupId });
                        setTargetTask(null);
                      },
                    },
                  );
                }}
                onTasksUpdate={(ids) => {
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
    </div>
  );
}

export { GroupTaskList, type GroupTaskListProps };
