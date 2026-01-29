import type { GroupStatus } from '@/entity/planner/groups';
import { GroupStatusToIconMap } from '@/entity/planner/groups/ui';
import type { TaskInfoEntity } from '@/entity/planner/tasks';
import dayjs, { getClosestTimeToNow } from '@/shared/lib/time';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { Card, CardFooter, CardHeader, CardTitle } from '@/shared/ui-kit/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui-kit/ui/tooltip';
import { cn } from '@/shared/ui-kit/utils';
import { Flame } from 'lucide-react';

interface GroupCartProps {
  readonly name: string;
  readonly progress: number;
  readonly status: GroupStatus;
  readonly tags?: string[];
  readonly tasks: TaskInfoEntity[];
  readonly onClick?: () => void;
}

function GroupCart({ name, tags, progress, status, tasks, onClick }: GroupCartProps) {
  const Icon = GroupStatusToIconMap[status];

  const { total, overdue, done } = groupTaskCountFormat(tasks);

  const closestTaskDeadline = getClosestTimeToNow(tasks.map((t) => t.deadline));
  const isDeadlineToday =
    closestTaskDeadline != null ? dayjs(closestTaskDeadline).isToday() : false;

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
            {isDeadlineToday && <Flame className="size-5 stroke-red-600" />}

            <Tooltip>
              <TooltipTrigger asChild>
                <Icon
                  className={cn('size-5 min-w-5 min-h-5  mb-auto', {
                    'stroke-gray-400': status === 'NOT_STARTED',
                    'stroke-gray-500': status === 'IN_PROGRESS',
                    'stroke-green-600': status === 'DONE',
                  })}
                />
              </TooltipTrigger>

              <TooltipContent>
                <p>
                  {
                    { NOT_STARTED: 'Еще не начата', DONE: 'Завершена', IN_PROGRESS: 'В процессе' }[
                      status
                    ]
                  }
                </p>
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

function groupTaskCountFormat(tasks: TaskInfoEntity[]): {
  total: number;
  overdue: number;
  done: number;
} {
  return tasks.reduce<{ total: number; overdue: number; done: number }>(
    (acc, task) => {
      if (task.status === 'COMPLETED') {
        acc.done += 1;
      }

      if (task.status === 'OVERDUE') {
        acc.overdue += 1;
      }

      return acc;
    },
    { done: 0, overdue: 0, total: tasks.length },
  );
}

export { GroupCart, type GroupCartProps };
