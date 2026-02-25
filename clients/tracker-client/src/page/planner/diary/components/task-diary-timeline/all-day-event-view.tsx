import type { TaskEntity } from '@/entity/planner/tasks';
import { taskStatusToIconMap } from '@/entity/planner/tasks/lib/maps';
import { Typography } from '@/shared/components/typography';
import { TimeEvent } from '@/shared/lib/time-view/core';
import { cn } from '@/shared/ui-kit/utils';

interface AllDayEventViewProps {
  readonly event: TimeEvent<TaskEntity>;
  readonly onClick: (event: TimeEvent<TaskEntity>) => void;
}

function AllDayEventView({ event, onClick }: AllDayEventViewProps) {
  const Icon = taskStatusToIconMap[event.extra!.status];

  return (
    <article
      className={cn(
        'flex px-2',
        'cursor-pointer',
        'bg-gray-100 rounded-sm border border-gray-400 shadow-sm',
      )}
    >
      <li
        className="h-[20px] grid grid-cols-[1fr_min-content] grow items-center gap-1"
        onClick={() => void onClick(event)}
      >
        <Typography.H6 className="line-clamp-1 break-all">{event.name}</Typography.H6>

        <Icon className="size-3.5 ml-auto" />
      </li>
    </article>
  );
}

export { AllDayEventView, type AllDayEventViewProps };
