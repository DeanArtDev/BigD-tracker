import { Link2Off, SearchX } from 'lucide-react';
import { useRef, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskCard } from '@/entity/planner/tasks';
import { useTaskUpdateContext } from '@/feature/planner/task-update';
import { AppTooltip, VerticalDnD } from '@/shared/project-ui';
import { Button, DataLoader, ScrollAreaNativeVertical } from '@/shared/ui-kit';
import { useGetDetailedGroup } from '../_api';
import { GroupTaskListHeader } from './group-task-list-header';

interface GroupTaskListProps {
  readonly groupId: GroupId;
}

function GroupTaskList({ groupId }: GroupTaskListProps) {
  const { tasks, initialLoading, isEmptyTasks, isError, refetch } = useGetDetailedGroup({ groupId });
  const { openTaskUpdate } = useTaskUpdateContext();

  const [localTasks, setLocalTasks] = useState(tasks);

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col h-full border-2 rounded-xl">
      <GroupTaskListHeader groupId={groupId} />

      <ScrollAreaNativeVertical ref={containerRef}>
        <ul className="flex grow flex-col h-full min-w-0 min-h-0 relative">
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
              <VerticalDnD
                items={localTasks}
                className="gap-2"
                getId={(task) => task.id}
                onChange={({ items }) => void setLocalTasks(items)}
                renderItem={({ item: task, setNodeRef, style, handleProps }) => {
                  return (
                    <div style={style} {...handleProps} ref={setNodeRef}>
                      <TaskCard
                        id={task.id}
                        className="group/task-card-wrapper"
                        priority={task.priority}
                        status={task.status}
                        name={task.name}
                        afterHeaderSlot={
                          <AppTooltip content="Отвязать дело от группы" delayDuration={1500}>
                            <Button
                              className="opacity-0 transition-opacity group-hover/task-card-wrapper:opacity-100 focus-visible:opacity-100"
                              size="icon-sm"
                              variant="ghost"
                              onKeyDown={(evt) => {
                                evt.stopPropagation();
                                evt.preventDefault();
                              }}
                              onTouchStart={(evt) => {
                                evt.stopPropagation();
                                evt.preventDefault();
                              }}
                              onPointerDown={(evt) => {
                                evt.stopPropagation();
                                evt.preventDefault();
                              }}
                            >
                              <Link2Off className="stroke-muted-foreground" />
                            </Button>
                          </AppTooltip>
                        }
                        onContentClick={() => void openTaskUpdate(task)}
                        onHeaderClick={() => void console.log('header click')}
                      />
                    </div>
                  );
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
