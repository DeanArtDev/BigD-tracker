import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { TaskDeadlineDate, TaskFrame } from '@/entity/planner/tasks/ui';
import type { ReactNode } from 'react';

interface TaskInboxCardProps {
  readonly task: TaskInboxEntity;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly actionsSlot?: ReactNode;
}

function TaskInboxCard({ task, className, actionsSlot, onClick }: TaskInboxCardProps) {
  const { name, priority, deadline } = task;

  return (
    <TaskFrame
      name={name}
      className={className}
      priority={priority}
      footerSlot={deadline != null && <TaskDeadlineDate deadline={new Date(deadline)} size={12} />}
      actionsSlot={actionsSlot}
      onClick={onClick}
    />
  );
}

export { TaskInboxCard, type TaskInboxCardProps };
