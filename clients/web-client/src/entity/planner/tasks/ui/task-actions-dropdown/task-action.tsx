import type { ComponentProps, PropsWithChildren } from 'react';
import { MaybePromise } from '@/shared/lib';
import { DropdownItem } from '@/shared/project-ui';
import { DropdownMenuItem } from '@/shared/ui-kit';
import { taskActionToIconMap } from '../../lib/maps';
import { TaskActionType } from '../../model';

interface TaskActionProps {
  readonly action: TaskActionType;
  readonly loading?: boolean;
  readonly onClick?: () => MaybePromise<void>;
  readonly variant?: ComponentProps<typeof DropdownMenuItem>['variant'];
}

function TaskAction({ children, action, variant, loading = false, onClick }: PropsWithChildren<TaskActionProps>) {
  const Icon = taskActionToIconMap[action];

  return (
    <DropdownItem variant={variant} disabled={loading} onClick={onClick}>
      <Icon />
      {children}
    </DropdownItem>
  );
}

export { TaskAction, type TaskActionProps };
