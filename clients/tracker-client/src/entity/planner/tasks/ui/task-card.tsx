import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { TaskDeadlineDate } from '@/entity/planner/tasks/ui';
import { cn } from '@/shared/ui-kit/utils';
import type { ReactNode } from 'react';

interface ThingCardProps {
  readonly task: TaskInboxEntity;
  readonly onClick?: (task: TaskInboxEntity) => void;
  readonly actionsSlot?: ReactNode;
}

function TaskCard({ task, actionsSlot, onClick }: ThingCardProps) {
  const { name, priority = 0, deadline } = task;

  const showPriority = priority >= 0 && priority < 4;

  return (
    <li
      className="group bg-background relative p-2 sm:p-2 flex justify-center w-full rounded-md border shadow-md min-h-[50px] hover:opacity-100"
      onClick={(evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        void onClick?.(task);
      }}
    >
      <div className="flex flex-col grow w-[calc(100%-40px)]">
        <span className="text-sm truncate pr-2 mb-auto">{name}</span>

        <div className="flex flex-wrap gap-1.5 mr-auto">
          {deadline != null && <TaskDeadlineDate deadline={new Date(deadline)} size={12} />}
        </div>
      </div>

      {actionsSlot}

      {task.priority != null && showPriority && (
        <div
          className={cn(
            'absolute top-0 right-0 w-4 h-4 [clip-path:polygon(100%_0,0_0,100%_100%)] rounded-tr-sm',
            {
              [`bg-(--priority-1)`]: priority === 1,
              [`bg-(--priority-2)`]: priority === 2,
              [`bg-(--priority-3)`]: priority === 3,
              [`bg-(--priority-4)`]: priority === 4,
            },
          )}
        />
      )}
    </li>
  );
}

export { TaskCard, type ThingCardProps };
