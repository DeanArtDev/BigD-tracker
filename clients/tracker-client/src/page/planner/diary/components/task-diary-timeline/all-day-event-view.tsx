import { type TaskEntity, TaskStatus, TaskType } from '@/entity/planner/tasks';
import { taskStatusToIconMap } from '@/entity/planner/tasks/lib/maps';
import { Typography } from '@/shared/components/typography';
import { TimeEvent } from '@/shared/lib/time-view/core';
import { cn } from '@/shared/ui-kit/utils';
import { Repeat } from 'lucide-react';

interface AllDayEventViewProps {
  readonly event: TimeEvent<TaskEntity>;
  readonly onClick: (event: TimeEvent<TaskEntity>) => void;
}

function AllDayEventView({ event, onClick }: AllDayEventViewProps) {
  const Icon = taskStatusToIconMap[event.extra!.status];
  const isRepeatable = [TaskType.OVERRIDE, TaskType.VIRTUAL].some((t) => t === event.extra?.type);
  const isPriorityIndicate = [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED].some((s) => s === event.extra?.status);

  return (
    <article
      className={cn(
        'flex px-2',
        'cursor-pointer',
        'bg-gray-100 rounded-sm border border-gray-400 shadow-sm',
        isPriorityIndicate && {
          [`border-(--priority-1)`]: event.extra?.priority === 1,
          [`border-(--priority-2)`]: event.extra?.priority === 2,
          [`border-(--priority-3)`]: event.extra?.priority === 3,
        },
      )}
    >
      <li
        className="h-[20px] grid grid-cols-[1fr_min-content] grow items-center gap-1"
        onClick={() => void onClick(event)}
      >
        <Typography.H6 className="line-clamp-1 break-all">{event.name}</Typography.H6>

        <div className="flex gap-1 items-center">
          {isRepeatable && <Repeat className="size-3 ml-auto" />}
          <Icon className="size-3.5 " />
        </div>
      </li>
    </article>
  );
}

export { AllDayEventView, type AllDayEventViewProps };
