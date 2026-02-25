import { TaskStatus } from '@/entity/planner/tasks';
import { taskStatusToIconMap } from '@/entity/planner/tasks/lib/maps';
import { AppTooltip } from '@/shared/components/app-tooltip';
import { cn } from '@/shared/ui-kit/utils';
import { memo } from 'react';

interface TaskStatusIndicationProps {
  readonly status: TaskStatus;
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

const TaskStatusIndication = memo(({ status, size = 'md' }: TaskStatusIndicationProps) => {
  const StatusIcon = taskStatusToIconMap[status];

  return (
    <AppTooltip content={statusToHintMap[status]}>
      <StatusIcon
        className={cn({
          'size-3 stroke-3': size === 'sm',
          'size-4 stroke-3': size === 'md',
          'size-4.5 stroke-4': size === 'lg',
        })}
      />
    </AppTooltip>
  );
});

export { TaskStatusIndication, type TaskStatusIndicationProps };
