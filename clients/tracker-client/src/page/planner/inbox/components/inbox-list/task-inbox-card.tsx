import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { TaskDeadlineDate, TaskFrame } from '@/entity/planner/tasks/ui';
import type { ReactNode } from 'react';

interface ThingInboxCardProps {
  readonly task: TaskInboxEntity;
  readonly onClick?: () => void;
  readonly actionsSlot?: ReactNode;
}

function TaskInboxCard({ task, actionsSlot, onClick }: ThingInboxCardProps) {
  const { name, priority, deadline } = task;

  return (
    <TaskFrame
      name={name}
      priority={priority}
      footerSlot={deadline != null && <TaskDeadlineDate deadline={new Date(deadline)} size={12} />}
      actionsSlot={actionsSlot}
      onClick={onClick}
    />
  );
}

export { TaskInboxCard, type ThingInboxCardProps };
