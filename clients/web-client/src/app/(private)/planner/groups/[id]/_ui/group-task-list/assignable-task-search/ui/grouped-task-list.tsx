import { TaskId } from '@/entity/planner/tasks';
import { TaskPriority } from '@/entity/schema-types';
import { cn, Field, FieldContent, FieldLabel, Typography } from '@/shared/ui-kit';

interface GroupedTaskListProps {
  readonly groupName: string;
  readonly tasks: { id: TaskId; name: string; priority: TaskPriority }[];
  readonly onTaskSelect: (task: { id: TaskId; name: string }) => void;
}

function GroupedTaskList({ groupName, tasks, onTaskSelect }: GroupedTaskListProps) {
  return (
    <Field className="w-full">
      <FieldLabel>
        <Typography.H5 className="truncate">{groupName}</Typography.H5>
      </FieldLabel>

      <FieldContent className="task-container">
        <ul className="flex flex-col">
          {tasks.map(({ id, name, priority }) => {
            return (
              <span
                key={id}
                className={cn(
                  'border-b last-of-type:border-none py-2 pl-6 truncate hover:bg-muted rounded cursor-default',
                  priority !== TaskPriority.Delete &&
                    "relative before:absolute before:left-2 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:content-['']",
                  {
                    [`before:bg-(--priority-1)`]: priority === TaskPriority.Do,
                    [`before:bg-(--priority-2)`]: priority === TaskPriority.Plan,
                    [`before:bg-(--priority-3)`]: priority === TaskPriority.Delegate,
                  },
                )}
                onClick={() => void onTaskSelect({ id, name })}
              >
                {name}
              </span>
            );
          })}
        </ul>
      </FieldContent>
    </Field>
  );
}

export { GroupedTaskList, type GroupedTaskListProps };
