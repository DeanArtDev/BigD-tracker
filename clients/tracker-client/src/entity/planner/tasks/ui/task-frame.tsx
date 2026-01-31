import { Typography } from '@/shared/components/typography';
import type { VerticalDndItemRenderProps } from '@/shared/components/vertical-dnd';
import { cn } from '@/shared/ui-kit/utils';
import type { ReactNode } from 'react';

interface TaskFrameProps extends VerticalDndItemRenderProps {
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
  const showPriority = [1, 2, 3].includes(prior);

  return (
    <li
      className={cn(
        'task-frame bg-background relative p-2 sm:p-2 flex justify-center w-full rounded-md border shadow-md hover:shadow',
        className,
      )}
      ref={ref}
      style={style}
      onClick={(evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        void onClick?.();
      }}
    >
      <div className="flex flex-col grow w-[calc(100%-40px)]">
        <div className="flex grow w-full items-center mb-auto">
          {beforeNameSlot}

          <Typography.H4 className="text-sm font-normal truncate pr-2">{name}</Typography.H4>
        </div>
        <div className="flex flex-wrap gap-1.5 mr-auto">{footerSlot}</div>
      </div>

      {actionsSlot}

      {showPriority && (
        <div
          className={cn(
            'absolute top-0 right-0 w-4 h-4 [clip-path:polygon(100%_0,0_0,100%_100%)] rounded-tr-sm',
            {
              [`bg-(--priority-1)`]: prior === 1,
              [`bg-(--priority-2)`]: prior === 2,
              [`bg-(--priority-3)`]: prior === 3,
            },
          )}
        />
      )}
    </li>
  );
}

export { TaskFrame, type TaskFrameProps };
