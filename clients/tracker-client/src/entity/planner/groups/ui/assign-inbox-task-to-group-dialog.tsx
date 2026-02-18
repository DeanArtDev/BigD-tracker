import { type GroupInfoEntity, useGroupsAssignableQuery } from '@/entity/planner/groups';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { Button } from '@/shared/ui-kit/ui/button';
import { useState } from 'react';
import { AssignableGroupPicker } from './assignable-group-picker';

interface AssignInboxTaskToGroupDialogProps {
  readonly loading?: boolean;
  readonly taskGroupId?: number;
  readonly onSelect: (item: GroupInfoEntity, close: () => void) => void;
  readonly onInboxSelect?: (item: GroupInfoEntity, close: () => void) => void;
}

function AssignInboxTaskToGroupDialog({
  taskGroupId,
  loading,
  onSelect,
  onInboxSelect,
}: AssignInboxTaskToGroupDialogProps) {
  const { infoGroups = [], isLoading: isGroupAssignableLoading } = useGroupsAssignableQuery();
  const [open, setOpen] = useState(false);

  return (
    <AppDialog
      open={open}
      className="h-full max-h-[60vh] sm:max-h-[400px] w-[90vw] sm:w-[400px]"
      trigger={
        <Button size="xs" variant="outline" type="button" disabled={loading}>
          Переместить
        </Button>
      }
      onOpenChange={setOpen}
    >
      <AssignableGroupPicker
        disabled={isGroupAssignableLoading || loading}
        items={infoGroups}
        taskGroupId={taskGroupId}
        onSelect={(item) => {
          onSelect(item, () => void setOpen(false));
        }}
        onInboxSelect={(item) => {
          onInboxSelect?.(item, () => void setOpen(false));
        }}
      />
    </AppDialog>
  );
}

export { AssignInboxTaskToGroupDialog, type AssignInboxTaskToGroupDialogProps };
