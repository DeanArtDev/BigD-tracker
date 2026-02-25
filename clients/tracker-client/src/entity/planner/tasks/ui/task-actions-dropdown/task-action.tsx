import { TaskActionType } from '../../model';
import { DropdownMenuItem } from '@/shared/ui-kit/ui/dropdown-menu';
import type { ComponentProps, PropsWithChildren } from 'react';
import { taskActionToIconMap } from '../../lib/maps';

interface TaskActionProps {
  readonly action: TaskActionType;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly variant?: ComponentProps<typeof DropdownMenuItem>['variant'];
}

function TaskAction({
  children,
  action,
  variant,
  loading = false,
  onClick,
}: PropsWithChildren<TaskActionProps>) {
  const Icon = taskActionToIconMap[action];

  return (
    <DropdownMenuItem
      variant={variant}
      key="finish"
      disabled={loading}
      onClick={(evt) => {
        evt.stopPropagation();
        onClick?.();
      }}
    >
      <Icon />
      {children}
    </DropdownMenuItem>
  );
}

export { TaskAction, type TaskActionProps };
