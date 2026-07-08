'use client';

import { Repeat2, Timer } from 'lucide-react';
import { CSSProperties, ReactNode, Ref } from 'react';
import { TaskDomain, TaskId } from '@/entity/planner/tasks';
import { TaskStatus } from '@/entity/schema-types';
import { TimeHelper } from '@/shared/lib/time';
import { Badge, Card, CardContent, CardTitle, cn, Typography } from '@/shared/ui-kit';
import { TaskUtils } from '../../lib/utils';
import { TaskStatusIndication } from '../task-status-indication';

interface TaskCardProps {
  readonly id: TaskId;
  readonly name: string;
  readonly priority: number;
  readonly status: TaskStatus;

  readonly deadline?: string;
  readonly repeatable?: boolean;

  readonly afterHeaderSlot?: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
  readonly style?: CSSProperties;

  readonly onHeaderClick?: () => void;
  readonly onContentClick?: () => void;
}

function TaskCard(props: TaskCardProps) {
  const {
    id,
    name,
    priority,
    style,
    ref,
    status,
    repeatable = false,
    deadline,
    afterHeaderSlot,
    onHeaderClick,
    onContentClick,
  } = props;

  const prior = Number(priority);
  const isPriorityValid = [1, 2, 3].includes(prior);
  const isDeadlineSoon = TimeHelper.isLessThan24HoursLeft(deadline);
  const showIndications = TaskDomain.isAllowAccentIndicationTask(status, TaskDomain.parseId(id, false).type);

  return (
    <Card
      ref={ref}
      style={style}
      className="task-card p-3 relative hover:shadow"
      onClick={(evt) => {
        if (onContentClick != null) {
          evt.stopPropagation();
          onContentClick();
        }
      }}
    >
      {isPriorityValid && (
        <div
          className={cn('absolute top-0 left-0 bottom-0 w-[5px] h-full rounded-tl-md rounded-bl-md', {
            [`bg-(--priority-1)`]: prior === 1,
            [`bg-(--priority-2)`]: prior === 2,
            [`bg-(--priority-3)`]: prior === 3,
          })}
        />
      )}

      <CardTitle className="grid grid-cols-[1fr_max-content]">
        <Typography.H5 className="truncate px-2">
          <span
            className="hover:underline hover:decoration-solid cursor-pointer"
            onClick={(evt) => {
              if (onHeaderClick != null) {
                evt.stopPropagation();
                onHeaderClick();
              }
            }}
          >
            {name}
          </span>
        </Typography.H5>

        {afterHeaderSlot}
      </CardTitle>

      <CardContent className="flex flex-wrap gap-3 p-0 pr-1.5 items-center">
        {deadline != null && (
          <Badge variant={isDeadlineSoon && showIndications ? 'destructive' : 'outline'}>
            <Timer />
            {TaskUtils.formatTaskDate(deadline)}
          </Badge>
        )}

        {repeatable && (
          <Badge variant="secondary" className="p-1">
            <Repeat2 className="size-4" />
          </Badge>
        )}

        <TaskStatusIndication className="ml-auto" status={status} size="md" />
      </CardContent>
    </Card>
  );
}

export { TaskCard, type TaskCardProps };
