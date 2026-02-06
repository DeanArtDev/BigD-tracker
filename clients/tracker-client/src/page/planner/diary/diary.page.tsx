import { type TaskEntity, useDiaryTasksQuery } from '@/entity/planner/tasks';
import { TaskEdit } from '@/feature/planner/tasks/task-edit';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { TimeView } from '@/shared/lib/time-view';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useMemo, useState } from 'react';

function DiaryPage() {
  const [dateSet, setDateSet] = useState<{ from: string; to: string }>();
  const { tasks, isLoading } = useDiaryTasksQuery({ filters: dateSet });

  const [selectedTask, setSelectedTask] = useState<TaskEntity>();

  const events = useMemo(() => {
    return tasks.map((thing) => {
      return {
        name: thing.name,
        from: thing.startDate != null ? new Date(thing.startDate) : 0,
        to: thing.deadline != null ? new Date(thing.deadline) : 0,
        extra: thing,
      };
    });
  }, [tasks]);

  return (
    <PageWrapper className="relative grow min-h-0" title="Ежедневник">
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
    </PageWrapper>
  );
}

export const Component = DiaryPage;
