import type { GroupStatus } from '@/entity/planner/groups';
import { isAllowAccentIndicationGroup } from '@/entity/planner/groups/lib/helpers';
import { GroupStatusIndication } from '@/entity/planner/groups/ui';
import type { TaskEntity } from '@/entity/planner/tasks';
import { getTasksStatusCount } from '@/entity/planner/tasks/lib';
import { Typography } from '@/shared/components/typography';
import dayjs, { getClosestTimeToNow } from '@/shared/lib/time';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { Card, CardFooter, CardHeader, CardTitle } from '@/shared/ui-kit/ui/card';
import { Skeleton } from '@/shared/ui-kit/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui-kit/ui/tooltip';
import { Flame } from 'lucide-react';

interface GroupCardProps {
  readonly name: string;
  readonly progress: number;
  readonly status: GroupStatus;
  readonly tags?: string[];
  readonly tasks: TaskEntity[];
  readonly onClick?: () => void;
}

function GroupCard({ name, tags, progress, status, tasks, onClick }: GroupCardProps) {
  const { total, overdue, done } = getTasksStatusCount(tasks);

  const closestTaskDeadline = getClosestTimeToNow(tasks.map((t) => t.deadline));
  const isDeadlineToday =
    closestTaskDeadline != null ? dayjs(closestTaskDeadline).isToday() : false;
  const isAllowIndicationGroup = isAllowAccentIndicationGroup(status);

  return (
    <Card
      className="group/group-card grow gap-1 py-3 relative overflow-hidden hover:bg-gray-50 hover:shadow-xl"
      onClick={onClick}
    >
      <div
        className="group-card-progress absolute inset-y-0 left-0 bg-primary/20 transition-[width] duration-200"
        style={{ width: `${progress}%` }}
      />

      <CardHeader className="w-full px-3">
        <CardTitle className="inline-flex gap-2 items-center">
          {name}

          <div className="flex gap-2 ml-auto">
            {isDeadlineToday && isAllowIndicationGroup && (
              <Flame className="size-5 stroke-red-600" />
            )}

            <Tooltip>
              <TooltipTrigger>
                <GroupStatusIndication status={status} />
              </TooltipTrigger>

              <TooltipContent>
                <Typography.P>
                  {
                    { NOT_STARTED: 'Еще не начата', DONE: 'Завершена', IN_PROGRESS: 'В процессе' }[
                      status
                    ]
                  }
                </Typography.P>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardTitle>
      </CardHeader>

      <CardFooter className="w-full px-3 gap-0 relative">
        {tags != null && (
          <ul className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <li className="flex">
                <Badge key={tag} variant="secondary" className="border border-gray-300">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="text-sm ml-auto mr-1.25">
          <span>{total}</span>

          {done !== 0 && (
            <>
              {` / `} <span className="text-green-600">{done}</span>
            </>
          )}
          {overdue !== 0 && (
            <>
              {` / `}
              <span className="text-red-500">{overdue}</span>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

const GroupCardSkeleton = () => <Skeleton className="h-18 w-full rounded-xl" />;

export { GroupCard, type GroupCardProps, GroupCardSkeleton };
