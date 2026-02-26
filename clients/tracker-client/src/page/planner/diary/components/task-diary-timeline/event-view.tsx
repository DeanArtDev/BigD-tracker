import { type TaskEntity, TaskStatus } from '@/entity/planner/tasks';
import { taskStatusToIconMap } from '@/entity/planner/tasks/lib/maps';
import { Typography } from '@/shared/components/typography';
import dayjs from '@/shared/lib/time';
import { TimeEvent } from '@/shared/lib/time-view/core';
import { cn } from '@/shared/ui-kit/utils';

interface EventViewProps {
  readonly event: TimeEvent<TaskEntity>;
  readonly onClick: (event: TimeEvent<TaskEntity>) => void;
}

function EventView({ event, onClick }: EventViewProps) {
  const Icon = taskStatusToIconMap[event.extra!.status];
  const isPriorityIndicate = [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED].some(
    (s) => s === event.extra?.status,
  );

  return (
    <article
      className={cn(
        'flex px-2 py-1 h-full min-h-[50px]',
        'cursor-pointer',
        'bg-gray-100 rounded shadow-lg overflow-hidden border border-(--priority-4)/80',
        isPriorityIndicate && {
          [`border-(--priority-1)`]: event.extra?.priority === 1,
          [`border-(--priority-2)`]: event.extra?.priority === 2,
          [`border-(--priority-3)`]: event.extra?.priority === 3,
        },
      )}
      onClick={() => void onClick(event)}
    >
      <li className="relative flex flex-col items-start">
        <Icon className="size-3.5 absolute left-0 top-1" />

        <Typography.H6 className="flex line-clamp-1 break-all indent-[18px] leading-relaxed">
          {event.name}
        </Typography.H6>

        <time className="flex line-clamp-1 text-gray-600 text-xs items-center break-all">
          {`${dayjs(event.from).format('HH:mm')} - ${dayjs(event.to).format('HH:mm')}`}
        </time>
      </li>
    </article>
  );
}

export { EventView, type EventViewProps };
