'use client';

import { SearchX } from 'lucide-react';
import { useRef } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { DataLoader, ScrollAreaNativeVertical } from '@/shared/ui-kit';
import { GroupTaskListForm } from './group-task-list-form';
import { GroupTaskListHeader } from './group-task-list-header';
import { useGetDetailedGroup } from '../../_api';

interface GroupTaskListProps {
  readonly groupId: GroupId;
}

function GroupTaskList({ groupId }: GroupTaskListProps) {
  const { group, tasks, initialLoading, isEmptyTasks, isError, refetch } = useGetDetailedGroup({ groupId });
  const { openTaskUpdate } = useTaskUpdateContext();

  const { updateGroup } = useGroupUpdateFeature();

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col h-full border-2 min-w-0 min-h-0 rounded-xl">
      <GroupTaskListHeader groupId={groupId} />

      <ScrollAreaNativeVertical className="grow" ref={containerRef}>
        <ul className="flex grow flex-col h-full">
          <DataLoader
            isLoading={initialLoading}
            isEmpty={isEmptyTasks}
            isError={isError}
            errorElement={<DataLoader.Error onRetry={refetch} />}
            emptyElement={
              <DataLoader.Empty
                title="У группы еще нет дел, назначить?"
                icon={<SearchX className="size-7 text-muted-foreground" strokeWidth={2} />}
              />
            }
          >
            <div className="p-3">
              <GroupTaskListForm
                tasks={tasks}
                onContentClick={(task) => void openTaskUpdate(task)}
                onHeaderClick={() => void console.log('header click')}
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
          </DataLoader>
        </ul>
      </ScrollAreaNativeVertical>
    </div>
  );
}

export { GroupTaskList, type GroupTaskListProps };
