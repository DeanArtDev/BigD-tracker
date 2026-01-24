import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { TaskDelete } from '@/entity/planner/tasks/ui';
import { Button } from '@/shared/ui-kit/ui/button';
import { LeftSwiper } from '@/shared/ui-kit/ui/left-swiper';
import { Trash } from 'lucide-react';
import { TaskCard } from './task-card';

interface ThingCardMobileProps {
  readonly task: TaskInboxEntity;
  readonly onClick?: (thing: TaskInboxEntity) => void;
  readonly onDeleteSuccess?: () => void;
}

function TaskCardMobile({ task, onClick, onDeleteSuccess }: ThingCardMobileProps) {
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
      <TaskCard task={task} onClick={onClick} />
    </LeftSwiper>
  );
}

export { TaskCardMobile, type ThingCardMobileProps };
