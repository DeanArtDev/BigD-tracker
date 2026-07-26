'use client';

import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskDomain, TaskStatusIndication } from '@/entity/planner/tasks';
import { TaskStatus } from '@/shared/transport/graphql';
import { ButtonLoading, Field, FieldLabel } from '@/shared/ui-kit';
import { AssignTaskToGroupDialog } from './assign-task-to-group-dialog';
import { useGetDetailedGroupSuspense } from '../../_api';

interface GroupTaskListHeaderProps {
  readonly groupId: GroupId;
}

function GroupTaskListHeader({ groupId }: GroupTaskListHeaderProps) {
  const { tasks, isEmptyTasks } = useGetDetailedGroupSuspense({ groupId });

  const { overdue, inProgress, notStarted, done } = TaskDomain.tasksCountByStatus(tasks);

  const [open, setOpen] = useState(false);

  return (
    <div className="grid grid-cols-[repeat(4,max-content)_1fr] gap-4 items-center border-b-2 p-4 min-h-16.5">
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

      {!isEmptyTasks && (
        <AssignTaskToGroupDialog
          groupId={groupId}
          trigger={({ loading }) => (
            <ButtonLoading className="ml-auto" size="icon" variant="secondary" loading={loading}>
              {!loading && <Link2 />}
            </ButtonLoading>
          )}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}

export { GroupTaskListHeader, type GroupTaskListHeaderProps };
