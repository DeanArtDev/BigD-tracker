import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui-kit/ui/tooltip';
import type { PropsWithChildren } from 'react';

interface ExerciseEditTooltipProps {
  readonly on?: boolean;
}

function ExerciseEditTooltip({
  on = false,
  children,
}: PropsWithChildren<ExerciseEditTooltipProps>) {
  if (on) {
    return (
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        <TooltipContent>
          <p>Редактировать можно только свои упражнения</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return children;
}

export { ExerciseEditTooltip, type ExerciseEditTooltipProps };
