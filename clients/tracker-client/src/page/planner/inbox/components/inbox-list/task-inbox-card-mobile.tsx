import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { LeftSwiper } from '@/shared/ui-kit/ui/left-swiper';
import { InboxCardActions } from './inbox-card-actions';
import { TaskInboxCard } from './task-inbox-card';

interface TaskInboxCardProps {
  readonly task: TaskInboxEntity;
  readonly openId?: number;
  readonly loading: boolean;
  readonly onClick?: () => void;
  readonly onFinish: () => void;
  readonly onDelete: () => void;
  readonly setOpenId?: (openId?: number) => void;
}

function TaskInboxCardMobile({
  task,
  openId,
  loading,
  onClick,
  onDelete,
  onFinish,
  setOpenId,
}: TaskInboxCardProps) {
  return (
    <LeftSwiper
      id={task.id}
      openId={openId}
      setOpenId={setOpenId}
      actionsSpace={75}
      content={({ reset }) => (
        <InboxCardActions
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
        <TaskInboxCard
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

export { TaskInboxCardMobile, type TaskInboxCardProps };
