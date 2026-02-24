import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui-kit/ui/tooltip';
import type { ComponentProps, ReactNode } from 'react';

interface AppTooltipProps extends ComponentProps<typeof Tooltip> {
  readonly asChild?: boolean;
  readonly disable?: boolean;
  readonly content: ReactNode;
}

function AppTooltip({
  asChild = true,
  disable = false,
  children,
  content,
  ...props
}: AppTooltipProps) {
  if (disable) return children;

  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild={asChild}>
        <span className="inline-block w-fit">{children}</span>
      </TooltipTrigger>

      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}

export { AppTooltip, type AppTooltipProps };
