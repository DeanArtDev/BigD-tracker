import type { TaskEntity } from '@/entity/planner/tasks';
import { isAllowAccentIndicationTask } from '@/entity/planner/tasks/lib';
import { TaskDeadlineDate, TaskFrame, TaskStartDate } from '@/entity/planner/tasks/ui';
import type { ReactNode } from 'react';

interface ThingCardProps {
  readonly task: TaskEntity;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly actionsSlot?: ReactNode;
}

function TaskCard({ task, className, actionsSlot, onClick }: ThingCardProps) {
  const { name, priority, deadline, startDate, status } = task;
  const isAllowIndication = isAllowAccentIndicationTask(status);

  return (
    <TaskFrame
      name={name}
      className={className}
      priority={priority}
      footerSlot={
        <>
          {startDate != null && (
            <TaskStartDate
              warningIndication={isAllowIndication}
              startDate={new Date(startDate)}
              size={12}
            />
          )}

          {deadline != null && (
            <TaskDeadlineDate
              warningIndication={isAllowIndication}
              deadline={new Date(deadline)}
              size={12}
            />
          )}
        </>
      }
      actionsSlot={actionsSlot}
      onClick={onClick}
    />
  );
}

export { TaskCard, type ThingCardProps };
