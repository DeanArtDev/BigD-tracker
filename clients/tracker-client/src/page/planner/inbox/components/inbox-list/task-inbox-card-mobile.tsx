import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { TaskDelete } from '@/entity/planner/tasks/ui';
import { Button } from '@/shared/ui-kit/ui/button';
import { LeftSwiper } from '@/shared/ui-kit/ui/left-swiper';
import { Trash } from 'lucide-react';
import { TaskInboxCard } from './task-inbox-card';

interface TaskInboxCardProps {
  readonly task: TaskInboxEntity;
  readonly onClick?: () => void;
  readonly onDeleteSuccess?: () => void;
}

function TaskInboxCardMobile({ task, onClick, onDeleteSuccess }: TaskInboxCardProps) {
  return (
    <LeftSwiper
      actionsSpace={40}
      actions={
        <div className="flex items-center h-full">
          <TaskDelete taskId={task.id} onSuccess={onDeleteSuccess}>
            {({ isLoading }) => (
              <Button
                size="icon"
                disabled={isLoading}
                variant="ghost"
                onClick={(evt) => void evt.stopPropagation()}
              >
                <Trash />
              </Button>
            )}
          </TaskDelete>
        </div>
      }
    >
      <TaskInboxCard task={task} onClick={onClick} />
    </LeftSwiper>
  );
}

export { TaskInboxCardMobile, type TaskInboxCardProps };
