import type { GroupStatus } from '@/entity/planner/groups';
import { GroupStatusToIconMap } from './helpers';
import { TooltipTrigger } from '@/shared/ui-kit/ui/tooltip';
import { cn } from '@/shared/ui-kit/utils';

interface GroupStatusIndicationProps {
  readonly status: GroupStatus;
}

function GroupStatusIndication({ status }: GroupStatusIndicationProps) {
  const Icon = GroupStatusToIconMap[status];

  return (
    <TooltipTrigger asChild>
      <Icon
        className={cn('size-5 min-w-5 min-h-5  mb-auto', {
          'stroke-gray-400': status === 'NOT_STARTED',
          'stroke-gray-500': status === 'IN_PROGRESS',
          'stroke-green-600': status === 'DONE',
        })}
      />
    </TooltipTrigger>
  );
}

export { GroupStatusIndication, type GroupStatusIndicationProps };
