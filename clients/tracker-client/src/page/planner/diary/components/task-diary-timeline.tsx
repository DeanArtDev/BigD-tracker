import { type TaskEntity, TaskStatus, useTasksQuery } from '@/entity/planner/tasks';
import { TimeView } from '@/shared/lib/time-view';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useMemo, useState } from 'react';

interface TaskDiaryTimelineProps {
  readonly filterByGroup?: number[];
  readonly onEventClick: (task: TaskEntity | undefined) => void;
}

function TaskDiaryTimeline({ filterByGroup, onEventClick }: TaskDiaryTimelineProps) {
  const [dateSet, setDateSet] = useState<{ from: string; to: string }>();
  const { tasks } = useTasksQuery({
    sort: { startDate: 'ASC' },
    filter: {
      ...dateSet,
      group: filterByGroup,
      status: [TaskStatus.IN_PROGRESS, TaskStatus.OVERDUE, TaskStatus.COMPLETED],
    },
  });

  const events = useMemo(() => {
    return tasks.map((task) => {
      return {
        name: task.name,
        from: task.startDate != null ? new Date(task.startDate) : 0,
        to: task.deadline != null ? new Date(task.deadline) : 0,
        extra: task,
      };
    });
  }, [tasks, dateSet]);

  return (
    <DataLoader loadingElement={<AppLoader />}>
      <TimeView<TaskEntity>
        events={events}
        onEventClick={(event) => void onEventClick(event.extra)}
        onDateChange={(dateSet) =>
          void setDateSet({ from: dateSet.from.toISOString(), to: dateSet.to.toISOString() })
        }
      />
    </DataLoader>
  );
}

export { TaskDiaryTimeline, type TaskDiaryTimelineProps };
