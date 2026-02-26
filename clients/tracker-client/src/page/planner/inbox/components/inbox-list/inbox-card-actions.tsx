import { TaskActionType } from '@/entity/planner/tasks';
import { taskActionToHumanize, taskActionToIconMap } from '@/entity/planner/tasks/lib/maps';
import { AppTooltip } from '@/shared/components/app-tooltip';
import { ButtonLoading } from '@/shared/components/button-loading';
import { cn } from '@/shared/ui-kit/utils';
import { capitalize } from 'lodash-es';

interface InboxCardActionsProps {
  readonly className?: string;
  readonly loading: boolean;
  readonly onFinish: () => void;
  readonly onDelete: () => void;
}

function InboxCardActions({ loading, className, onFinish, onDelete }: InboxCardActionsProps) {
  const IconDelete = taskActionToIconMap[TaskActionType.DELETE];
  const IconFinish = taskActionToIconMap[TaskActionType.FINISH];

  return (
    <div className={cn('inbox-card-actions flex flex-row gap-2', className)}>
      <AppTooltip content={capitalize(taskActionToHumanize[TaskActionType.DELETE])}>
        <ButtonLoading
          isLoading={loading}
          size="icon"
          type="button"
          hideContent
          className="my-auto size-7"
          variant="ghost"
          onClick={(evt) => {
            evt.stopPropagation();
            onDelete();
          }}
        >
          <IconDelete />
        </ButtonLoading>
      </AppTooltip>

      <AppTooltip content={capitalize(taskActionToHumanize[TaskActionType.FINISH])}>
        <ButtonLoading
          isLoading={loading}
          size="icon"
          type="button"
          hideContent
          className="my-auto size-7"
          variant="ghost"
          onClick={(evt) => {
            evt.stopPropagation();
            onFinish();
          }}
        >
          <IconFinish />
        </ButtonLoading>
      </AppTooltip>
    </div>
  );
}

export { InboxCardActions, type InboxCardActionsProps };
