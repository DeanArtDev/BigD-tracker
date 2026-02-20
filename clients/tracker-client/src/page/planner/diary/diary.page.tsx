import { type TaskEntity, TaskStatus, useTasksQuery } from '@/entity/planner/tasks';
import { TaskCreation } from '@/feature/planner/tasks/task-creation';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { TimeView } from '@/shared/lib/time-view';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { cn } from '@/shared/ui-kit/utils';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

function DiaryPage() {
  const [dateSet, setDateSet] = useState<{ from: string; to: string }>();
  const { tasks, isLoading } = useTasksQuery({
    sort: { startDate: 'ASC' },
    filter: { ...dateSet, status: [TaskStatus.IN_PROGRESS] },
  });

  const [isTaskCreating, setIsTaskCreating] = useState(false);

  const [selectedTask, setSelectedTask] = useState<TaskEntity>();

  const events = useMemo(() => {
    return tasks.map((task) => {
      return {
        name: task.name,
        from: task.startDate != null ? new Date(task.startDate) : 0,
        to: task.deadline != null ? new Date(task.deadline) : 0,
        extra: task,
      };
    });
  }, [tasks]);

  return (
    <PageWrapper className="relative" title="Ежедневник">
      <DataLoader loadingElement={<AppLoader />} blur isLoading={isLoading}>
        <TimeView<TaskEntity>
          events={events}
          onEventClick={(event) => void setSelectedTask(event.extra)}
          onDateChange={(dateSet) =>
            void setDateSet({ from: dateSet.from.toISOString(), to: dateSet.to.toISOString() })
          }
        />
      </DataLoader>

      <TaskEdit
        task={selectedTask}
        onCansel={() => void setSelectedTask(undefined)}
        onSuccess={() => void setSelectedTask(undefined)}
      />

      <TaskCreation
        trigger={
          <Button
            size="icon"
            className={cn(
              'absolute bottom-5 sm:bottom-7 right-5 sm:right-5 rounded-full p-6 z-49',
              { 'sm:-right-15': isTaskCreating },
            )}
            onClick={() => void setIsTaskCreating(true)}
          >
            <Plus className="size-6" />
          </Button>
        }
        onCansel={() => void setIsTaskCreating(false)}
        onSuccess={() => void setIsTaskCreating(false)}
      />
    </PageWrapper>
  );
}

export const Component = DiaryPage;
