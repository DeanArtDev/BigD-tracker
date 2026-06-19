import type { ComponentProps, ReactNode } from 'react';
import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui-kit';

interface AppTooltipProps extends ComponentProps<typeof Tooltip> {
  readonly asChild?: boolean;
  readonly disable?: boolean;
  readonly content: ReactNode;
  readonly wrapperClassName?: string;
}

function AppTooltip({
  asChild = true,
  disable = false,
  children,
  content,
  wrapperClassName,
  ...props
}: AppTooltipProps) {
  if (disable) return children;

  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild={asChild}>
        <span className={cn('inline-block w-fit h-fit', wrapperClassName)}>{children}</span>
      </TooltipTrigger>

      <TooltipContent side="left">{content}</TooltipContent>
    </Tooltip>
  );
}

export { AppTooltip, type AppTooltipProps };
