import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { TaskDeadlineDate, TaskFrame } from '@/entity/planner/tasks/ui';
import type { ReactNode } from 'react';

interface ThingInboxCardProps {
  readonly task: TaskInboxEntity;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly actionsSlot?: ReactNode;
}

function TaskInboxCard({ task, className, actionsSlot, onClick }: ThingInboxCardProps) {
  const { name, priority, recurrence } = task;
  const { deadline } = recurrence ?? {};

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

export { TaskInboxCard, type ThingInboxCardProps };
