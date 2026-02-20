import type { TaskEntity } from '@/entity/planner/tasks';
import { TaskCard } from './task-card';
import { TaskCardActions } from './task-card-actions';
import { LeftSwiper } from '@/shared/ui-kit/ui/left-swiper';

interface TaskCardProps {
  readonly task: TaskEntity;
  readonly openId?: number;
  readonly loading: boolean;
  readonly onClick?: () => void;
  readonly onFinish: () => void;
  readonly onDelete: () => void;
  readonly setOpenId?: (openId?: number) => void;
}

function TaskCardMobile({
  task,
  openId,
  loading,
  onClick,
  onDelete,
  onFinish,
  setOpenId,
}: TaskCardProps) {
  return (
    <LeftSwiper
      id={task.id}
      openId={openId}
      setOpenId={setOpenId}
      actionsSpace={75}
      content={({ reset }) => (
        <TaskCardActions
          taskStatus={task.status}
          loading={loading}
          onDelete={() => {
            reset();
            onDelete();
          }}
          onFinish={() => {
            reset();
            onFinish();
          }}
        />
      )}
    >
      {({ reset }) => (
        <TaskCard
          className="min-h-[50px]"
          task={task}
          onClick={() => {
            reset();
            onClick?.();
          }}
        />
      )}
    </LeftSwiper>
  );
}

export { TaskCardMobile, type TaskCardProps };
