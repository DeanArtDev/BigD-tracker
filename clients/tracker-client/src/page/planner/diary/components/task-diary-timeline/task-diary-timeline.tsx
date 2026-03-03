import { type TaskEntity, useTasksDiaryQuery } from '@/entity/planner/tasks';
import { EventView } from './event-view';
import { TimeView } from '@/shared/lib/time-view';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useMemo, useState } from 'react';
import { AllDayEventView } from './all-day-event-view';

interface TaskDiaryTimelineProps {
  readonly filterByGroup?: number[];
  readonly onEventClick: (task: TaskEntity | undefined) => void;
}

function TaskDiaryTimeline({ onEventClick }: TaskDiaryTimelineProps) {
  const [dateSet, setDateSet] = useState<{ from: string; to: string }>();
  const { taskList } = useTasksDiaryQuery(dateSet);

  const events = useMemo(() => {
    return taskList.map((task) => {
      return {
        name: task.name,
        from: task.startDate != null ? new Date(task.startDate) : 0,
        to: task.deadline != null ? new Date(task.deadline) : 0,
        extra: task,
      };
    });
  }, [taskList, dateSet]);

  return (
    <DataLoader loadingElement={<AppLoader />}>
      <TimeView<TaskEntity>
        events={events}
        renderEvent={({ event }) => <EventView event={event} onClick={(event) => void onEventClick(event.extra)} />}
        renderALlDayEvent={({ event }) => (
          <AllDayEventView event={event} onClick={(event) => void onEventClick(event.extra)} />
        )}
        onDateChange={(dateSet) => void setDateSet({ from: dateSet.from.toISOString(), to: dateSet.to.toISOString() })}
      />
    </DataLoader>
  );
}

export { TaskDiaryTimeline, type TaskDiaryTimelineProps };
