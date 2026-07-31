import type { ComponentProps, ReactNode } from 'react';
import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui-kit';

interface AppTooltipProps extends ComponentProps<typeof Tooltip> {
  readonly asChild?: boolean;
  readonly side?: ComponentProps<typeof TooltipContent>['side'];
  readonly disable?: boolean;
  readonly skip?: boolean;
  readonly content: ReactNode;
  readonly className?: string;
}

function AppTooltip({
  asChild = true,
  disable = false,
  children,
  side = 'left',
  content,
  skip = false,
  className,
  ...props
}: AppTooltipProps) {
  if (disable) return children;

  if (skip) return children;
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild={asChild}>
        <span className={cn('inline-block w-fit h-fit', className)}>{children}</span>
      </TooltipTrigger>

      <TooltipContent side={side}>
        <span className="max-w-100 truncate">{content}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export { AppTooltip, type AppTooltipProps };
