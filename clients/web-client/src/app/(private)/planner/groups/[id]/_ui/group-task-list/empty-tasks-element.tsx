import { Link2, SearchX } from 'lucide-react';
import { useState } from 'react';
import { AssignTaskToGroupDialog } from '@/app/(private)/planner/groups/[id]/_ui/group-task-list/assign-task-to-group-dialog';
import { GroupId } from '@/entity/planner/groups';
import { ButtonLoading, DataLoader } from '@/shared/ui-kit';

interface EmptyTasksElementProps {
  readonly groupId: GroupId;
}

function EmptyTasksElement({ groupId }: EmptyTasksElementProps) {
  const [open, setOpen] = useState(false);

  return (
    <DataLoader.Empty
      title="В группе пока нет дел."
      icon={<SearchX className="size-7 text-muted-foreground" strokeWidth={2} />}
      description={
        <AssignTaskToGroupDialog
          groupId={groupId}
          trigger={({ loading }) => (
            <ButtonLoading variant="secondary" loading={loading}>
              Привязать
              {!loading && <Link2 />}
            </ButtonLoading>
          )}
          open={open}
          onOpenChange={setOpen}
        />
      }
    />
  );
}

export { EmptyTasksElement, type EmptyTasksElementProps };
