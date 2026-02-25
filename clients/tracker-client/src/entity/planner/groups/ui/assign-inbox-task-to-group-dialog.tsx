import { type GroupInfoEntity, useGroupsAssignableQuery } from '@/entity/planner/groups';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { type ReactNode, useState } from 'react';
import { AssignableGroupPicker } from './assignable-group-picker';

interface AssignInboxTaskToGroupDialogProps {
  readonly loading?: boolean;
  readonly trigger?: ReactNode;
  readonly taskGroupId?: number;
  readonly onSelect: (item: GroupInfoEntity, close: () => void) => void;
  readonly onInboxSelect?: (item: GroupInfoEntity, close: () => void) => void;
  readonly open?: boolean;
  readonly onOpenChange?: (value: boolean) => void;
}

function AssignInboxTaskToGroupDialog({
  taskGroupId,
  loading,
  trigger,
  open,
  onOpenChange,
  onSelect,
  onInboxSelect,
}: AssignInboxTaskToGroupDialogProps) {
  const { infoGroups = [], isLoading: isGroupAssignableLoading } = useGroupsAssignableQuery();
  const [_open, setOpen] = useState(open ?? false);

  const close = () => {
    onOpenChange?.(false);
    setOpen(false);
  };

  return (
    <AppDialog
      open={open ?? _open}
      mobileSpace={false}
      className="h-full max-h-[60vh] sm:max-h-[400px] w-[90vw] sm:w-[400px]"
      trigger={trigger}
      onOpenChange={(value) => {
        onOpenChange?.(value);
        setOpen(value);
      }}
    >
      <AssignableGroupPicker
        disabled={isGroupAssignableLoading || loading}
        items={infoGroups}
        taskGroupId={taskGroupId}
        onSelect={(item) => {
          onSelect(item, close);
        }}
        onInboxSelect={(item) => {
          onInboxSelect?.(item, close);
        }}
      />
    </AppDialog>
  );
}

export { AssignInboxTaskToGroupDialog, type AssignInboxTaskToGroupDialogProps };
