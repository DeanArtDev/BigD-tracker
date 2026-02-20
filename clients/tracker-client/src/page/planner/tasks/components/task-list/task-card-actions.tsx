import { ButtonLoading } from '@/shared/components/button-loading';
import { ButtonTrash } from '@/shared/components/button-trash';
import { cn } from '@/shared/ui-kit/utils';
import { CheckCheck } from 'lucide-react';

interface TaskCardActionsProps {
  readonly className?: string;
  readonly loading: boolean;
  readonly onFinish: () => void;
  readonly onDelete: () => void;
}

function TaskCardActions({ loading, className, onFinish, onDelete }: TaskCardActionsProps) {
  return (
    <div className={cn('task-card-actions flex flex-row gap-2', className)}>
      <ButtonTrash
        className="my-auto size-7"
        isLoading={loading}
        type="button"
        onClick={(evt) => {
          evt.stopPropagation();
          onDelete();
        }}
      />

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
        <CheckCheck />
      </ButtonLoading>
    </div>
  );
}

export { TaskCardActions, type TaskCardActionsProps };
