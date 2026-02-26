import { Typography } from '@/shared/components/typography';
import type { VerticalDndItemRenderProps } from '@/shared/components/vertical-dnd';
import { cn } from '@/shared/ui-kit/utils';
import type { ReactNode } from 'react';

interface TaskFrameProps extends Partial<VerticalDndItemRenderProps<HTMLDivElement>> {
  readonly name: string;
  readonly className?: string;
  readonly priority: number | string;
  readonly beforeNameSlot?: ReactNode;
  readonly actionsSlot?: ReactNode;
  readonly footerSlot?: ReactNode;
  readonly onClick?: () => void;
}

function TaskFrame({
  name,
  ref,
  priority,
  style,
  footerSlot,
  className,
  beforeNameSlot,
  actionsSlot,
  onClick,
}: TaskFrameProps) {
  const prior = Number(priority);
  const isPriorityValid = [1, 2, 3].includes(prior);

  return (
    <div
      className={cn(
        'group/task-frame bg-background relative flex justify-center w-full rounded-md border shadow-md hover:shadow',
        className,
      )}
      ref={ref}
      style={style}
    >
      <div
        className="flex flex-col grow w-[calc(100%-40px)] p-2 pl-3"
        onClick={(evt) => {
          evt.stopPropagation();
          evt.preventDefault();
          void onClick?.();
        }}
      >
        {isPriorityValid && (
          <div
            className={cn(
              'absolute top-0 left-0 bottom-0 w-[3px] h-full rounded-tl-md rounded-bl-md',
              {
                [`bg-(--priority-1)`]: prior === 1,
                [`bg-(--priority-2)`]: prior === 2,
                [`bg-(--priority-3)`]: prior === 3,
              },
            )}
          />
        )}

        <div className="flex grow w-full items-center mb-auto">
          {beforeNameSlot}

          <Typography.H4 className="text-sm font-normal line-clamp-1 pr-2 mb-auto">
            {name}
          </Typography.H4>
        </div>
        <div className="flex flex-wrap gap-1.5 mr-auto">{footerSlot}</div>
      </div>

      {actionsSlot}
    </div>
  );
}

export { TaskFrame, type TaskFrameProps };
