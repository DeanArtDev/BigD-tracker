import { Search } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { AssignableTask, useGetAssignableTasks } from '@/app/(private)/planner/groups/[id]/_api';
import { GroupId, useGetAssignableGroups } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { useDebounce } from '@/shared/lib';
import { Card, CardContent, cn, DataLoader, ScrollAreaNativeVertical } from '@/shared/ui-kit';
import { GroupedTaskList } from './ui/grouped-task-list';
import { TaskSearchInput } from './ui/task-search-input';

interface AssignableTaskSearchProps {
  readonly groupId: GroupId;
  readonly loading: boolean;
  readonly onTaskSelect: (task: { id: TaskId; name: string; groupId?: GroupId }) => void;
}

function AssignableTaskSearch({ groupId, loading, onTaskSelect }: AssignableTaskSearchProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 700);

  const { assignableTasks, loading: isAssignableTasksLoading } = useGetAssignableTasks({
    search: debouncedSearch,
    groupIds: [groupId],
  });
  const { groups } = useGetAssignableGroups();

  const [isPending, startTransition] = useTransition();

  const [{ groupToTasks, groupFreeTasks }, setGroupedTasksData] = useState<{
    groupFreeTasks: AssignableTask[];
    groupToTasks: [GroupId, AssignableTask[]][];
  }>(() => ({
    groupToTasks: [],
    groupFreeTasks: [],
  }));

  useEffect(() => {
    startTransition(() => {
      const map = new Map<GroupId, AssignableTask[]>();
      const groupFreeTasks: AssignableTask[] = [];

      for (const task of assignableTasks) {
        if (task.groupId != null) {
          if (map.has(task.groupId)) map.get(task.groupId)?.push(task);
          else map.set(task.groupId, [task]);
        } else {
          groupFreeTasks.push(task);
        }
      }

      setGroupedTasksData({ groupFreeTasks, groupToTasks: Array.from(map.entries()) });
    });
  }, [assignableTasks]);

  const hasTasks = assignableTasks.length > 0;
  const showSearchResult = debouncedSearch.length > 0 && !loading && !isPending && !isAssignableTasksLoading;

  return (
    <div className="relative">
      <TaskSearchInput
        loading={loading || isPending || isAssignableTasksLoading}
        value={search}
        onSearchChange={setSearch}
      />

      {showSearchResult && (
        <Card
          className={cn('absolute flex min-h-0 max-h-110 w-full mt-2 shadow-lg', {
            'h-110': assignableTasks.length > 10,
          })}
        >
          <CardContent className="min-h-0">
            <DataLoader
              isEmpty={!hasTasks}
              emptyElement={
                <DataLoader.Empty size="sm" title="Поиск не дал результата" icon={<Search className="size-5" />} />
              }
            >
              <ScrollAreaNativeVertical>
                <ul className="flex flex-col gap-4 grow min-w-0">
                  <DataLoader isEmpty={groupFreeTasks.length <= 0} emptyElement={null}>
                    <li>
                      <GroupedTaskList groupName="Дела без группы" tasks={groupFreeTasks} onTaskSelect={onTaskSelect} />
                    </li>
                  </DataLoader>

                  {groupToTasks.map(([groupId, tasks]) => {
                    const groupName = groups.byId[groupId]?.name;

                    if (groupName == null) return null;
                    return (
                      <li key={groupId} className="group-container flex flex-col gap-4 grow">
                        <GroupedTaskList groupName={groupName} tasks={tasks} onTaskSelect={onTaskSelect} />
                      </li>
                    );
                  })}
                </ul>
              </ScrollAreaNativeVertical>
            </DataLoader>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { AssignableTaskSearch, type AssignableTaskSearchProps };
