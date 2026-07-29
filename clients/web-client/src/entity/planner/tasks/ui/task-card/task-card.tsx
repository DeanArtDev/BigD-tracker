'use client';

import { Repeat2, Timer } from 'lucide-react';
import { CSSProperties, ReactNode, Ref } from 'react';
import { TaskDomain, TaskId } from '@/entity/planner/tasks';
import { TimeHelper } from '@/shared/lib/time';
import { TaskPriority, TaskStatus } from '@/shared/transport/graphql';
import { Badge, Card, CardContent, CardTitle, cn, Typography } from '@/shared/ui-kit';
import { TaskUtils } from '../../lib/utils';
import { TaskStatusIndication } from '../task-status-indication';

type TaskCardVariant = 'default' | 'disabled';

interface TaskCardProps {
  readonly id: TaskId;
  readonly name: string;
  readonly className?: string;
  readonly priority: TaskPriority;
  readonly status?: TaskStatus;

  readonly variant?: TaskCardVariant;

  readonly deadline?: string;
  readonly repeatable?: boolean;

  readonly afterHeaderSlot?: ({ variant }: { variant: TaskCardVariant }) => ReactNode;
  readonly beforeBottomRowSlot?: ({ variant }: { variant: TaskCardVariant }) => ReactNode;
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
    variant = 'default',
    className,
    repeatable = false,
    deadline,
    afterHeaderSlot,
    beforeBottomRowSlot,

    onHeaderClick,
    onContentClick,
  } = props;

  const isDeadlineSoon = TimeHelper.isLessThan24HoursLeft(deadline);
  const showIndications =
    status == null ? false : TaskDomain.isAllowAccentIndicationTask(status, TaskDomain.parseId(id, false).type);

  const isDisabled = variant === 'disabled';

  const hideContent = !repeatable && status == null && deadline == null;

  return (
    <Card
      aria-disabled={isDisabled}
      ref={ref}
      style={style}
      className={cn('task-card p-3 relative hover:shadow', className, {
        ['opacity-50']: isDisabled,
        'gap-0': hideContent,
      })}
      onClick={(evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        if (!isDisabled) onContentClick?.();
      }}
    >
      <div
        className={cn('absolute top-0 left-0 bottom-0 w-1.25 h-full rounded-tl-md rounded-bl-md', {
          [`bg-(--priority-1)`]: priority === TaskPriority.Do,
          [`bg-(--priority-2)`]: priority === TaskPriority.Plan,
          [`bg-(--priority-3)`]: priority === TaskPriority.Delegate,
        })}
      />

      <CardTitle className={cn('grid grid-cols-[1fr_max-content]')}>
        <Typography.H5 className="truncate px-2">
          <span
            className={cn({ 'hover:underline hover:decoration-solid cursor-pointer': !isDisabled })}
            onClick={(evt) => {
              evt.stopPropagation();
              evt.preventDefault();
              if (!isDisabled) onHeaderClick?.();
            }}
          >
            {name}
          </span>
        </Typography.H5>

        {afterHeaderSlot?.({ variant })}
      </CardTitle>

      <CardContent className="flex flex-wrap gap-3 p-0 pr-1.5 min-h-5 items-center">
        {beforeBottomRowSlot?.({ variant })}

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

        {status != null && (
          <TaskStatusIndication className="ml-auto cursor-default" disable={isDisabled} status={status} size="md" />
        )}
      </CardContent>
    </Card>
  );
}

export { TaskCard, type TaskCardProps };
