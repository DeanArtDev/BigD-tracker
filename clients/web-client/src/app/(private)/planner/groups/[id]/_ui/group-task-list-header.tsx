import { Link2 } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { TaskDomain, TaskStatusIndication } from '@/entity/planner/tasks';
import { TaskStatus } from '@/entity/schema-types';
import { AppTooltip } from '@/shared/project-ui';
import { Button, Field, FieldLabel } from '@/shared/ui-kit';
import { useGetDetailedGroup } from '../_api';

interface GroupTaskListHeaderProps {
  readonly groupId: GroupId;
}

function GroupTaskListHeader({ groupId }: GroupTaskListHeaderProps) {
  const { tasks } = useGetDetailedGroup({ groupId });

  const { overdue, inProgress, notStarted, done } = TaskDomain.tasksCountByStatus(tasks);

  return (
    <div className="grid grid-cols-[repeat(4,max-content)_1fr] gap-4 items-center border-b-2 p-4">
      <Field className="grid grid-cols-[min-content_1fr]">
        <TaskStatusIndication status={TaskStatus.InProgress} size="lg" />
        <FieldLabel>{`${inProgress} в работе`}</FieldLabel>
      </Field>

      <Field className="grid grid-cols-[min-content_1fr]">
        <TaskStatusIndication status={TaskStatus.Completed} size="lg" />
        <FieldLabel>{`${done} готово`}</FieldLabel>
      </Field>

      <Field className="grid grid-cols-[min-content_1fr]">
        <TaskStatusIndication status={TaskStatus.Overdue} size="lg" />
        <FieldLabel>{`${overdue} просрочено`}</FieldLabel>
      </Field>

      <Field className="grid grid-cols-[min-content_1fr]">
        <TaskStatusIndication status={TaskStatus.NotStarted} size="lg" />
        <FieldLabel>{`${notStarted} не начато`}</FieldLabel>
      </Field>

      <AppTooltip wrapperClassName="ml-auto" content="Привязать дело к группе" side="top">
        <Button size="icon" variant="secondary">
          <Link2 />
        </Button>
      </AppTooltip>
    </div>
  );
}

export { GroupTaskListHeader, type GroupTaskListHeaderProps };
