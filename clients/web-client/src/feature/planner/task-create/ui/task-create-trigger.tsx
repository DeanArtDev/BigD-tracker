import { Plus } from 'lucide-react';
import { ComponentProps } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { Button } from '@/shared/ui-kit';
import { SuccessHandler, useTaskCreateContext } from '../context/task-create.context';

interface TaskCreateTriggerProps extends ComponentProps<typeof Button> {
  readonly groupId?: GroupId;
  readonly onSuccess?: SuccessHandler;
}

function TaskCreateTrigger({ groupId, onSuccess, ...buttonProps }: TaskCreateTriggerProps) {
  const { openTaskCreate } = useTaskCreateContext();

  return (
    <Button size="icon" onClick={() => void openTaskCreate({ groupId, onSuccess })} {...buttonProps}>
      <Plus className="size-5" />
    </Button>
  );
}

export { TaskCreateTrigger, type TaskCreateTriggerProps };
