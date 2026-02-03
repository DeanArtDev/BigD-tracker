import { useTaskClone } from '@/entity/planner/tasks';
import { ButtonLoading } from '@/shared/components/button-loading';
import { cn } from '@/shared/ui-kit/utils';
import type { PropsWithChildren } from 'react';

interface TaskCloningButtonProps {
  readonly groupId?: number;
  readonly taskId: number;
  readonly className?: string;
  readonly onSuccess?: () => Promise<void> | void;
}

function TaskCloningButton({
  taskId,
  groupId,
  className,
  children,
  onSuccess,
}: PropsWithChildren<TaskCloningButtonProps>) {
  const { cloneTask, isPending } = useTaskClone();

  return (
    <ButtonLoading
      size="xs"
      variant="outline"
      type="button"
      className={cn(className)}
      isLoading={isPending}
      onClick={() => {
        cloneTask({ params: { path: { taskId } }, body: { data: { groupId } } }, { onSuccess });
      }}
    >
      {children != null ? children : 'Клонировать'}
    </ButtonLoading>
  );
}

export { TaskCloningButton };
