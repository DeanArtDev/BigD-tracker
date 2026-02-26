import { DropdownItem } from '@/shared/components/app-dropdown';
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
    <DropdownItem variant={variant} disabled={loading} onClick={onClick}>
      <Icon />
      {children}
    </DropdownItem>
  );
}

export { TaskAction, type TaskActionProps };
