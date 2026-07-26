import { memo } from 'react';
import { AppTooltip } from '@/shared/project-ui';
import { TaskStatus } from '@/shared/transport/graphql';
import { cn } from '@/shared/ui-kit';
import { taskStatusToIconMap } from '../lib/maps';

interface TaskStatusIndicationProps {
  readonly status: TaskStatus;
  readonly className?: string;
  readonly disable?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
}

const statusToHintMap: Record<TaskStatus, string> = {
  COMPLETED: 'Завершено',
  OVERDUE: 'Просрочено',
  CANCELED: 'Отменено',
  NOT_STARTED: 'Не начато',
  ARCHIVED: 'Архивное',
  DELETED: 'Удалено',
  IN_PROGRESS: 'В процессе',
};

const TaskStatusIndication = memo(function TaskStatusIndicationMemo({
  status,
  disable,
  className,
  size = 'md',
}: TaskStatusIndicationProps) {
  const StatusIcon = taskStatusToIconMap[status];

  return (
    <AppTooltip content={statusToHintMap[status]} disable={disable} className={className}>
      <StatusIcon
        className={cn(
          {
            'size-3 stroke-3': size === 'sm',
            'size-4 stroke-3': size === 'md',
            'size-4.5 stroke-3': size === 'lg',
          },
          className,
        )}
      />
    </AppTooltip>
  );
});

export { TaskStatusIndication, type TaskStatusIndicationProps };
