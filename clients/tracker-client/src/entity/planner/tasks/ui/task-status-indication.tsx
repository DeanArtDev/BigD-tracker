import { AppTooltip } from '@/shared/components/app-tooltip';
import { cn } from '@/shared/ui-kit/utils';
import { memo } from 'react';
import { taskStatusToIconMap } from '../lib/maps';
import { TaskStatus } from '../model';

interface TaskStatusIndicationProps {
  readonly status: TaskStatus;
  readonly className?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

const statusToHintMap: Record<TaskStatus, string> = {
  COMPLETED: 'Завершено',
  OVERDUE: 'Просрочено',
  CANCELLED: 'Отменено',
  NOT_STARTED: 'Не начато',
  ARCHIVED: 'Архивное',
  DELETED: 'Удалено',
  IN_PROGRESS: 'В процессе',
};

const TaskStatusIndication = memo(
  ({ status, className, size = 'md' }: TaskStatusIndicationProps) => {
    const StatusIcon = taskStatusToIconMap[status];

    return (
      <AppTooltip content={statusToHintMap[status]} wrapperClassName={className}>
        <StatusIcon
          className={cn({
            'size-3 stroke-3': size === 'sm',
            'size-4 stroke-3': size === 'md',
            'size-4.5 stroke-3': size === 'lg',
          })}
        />
      </AppTooltip>
    );
  },
);

export { TaskStatusIndication, type TaskStatusIndicationProps };
