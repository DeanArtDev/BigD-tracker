import { ReactNode, useState } from 'react';
import { GroupCacheManager, GroupId, invalidateGroup } from '@/entity/planner/groups';
import { useTaskAssignToGroupFeature } from '@/feature/planner/task-assign-to-group';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/ui-kit';
import { AssignableTaskSearch } from './assignable-task-search';

interface AssignTaskToGroupDialogProps {
  readonly open: boolean;
  readonly groupId: GroupId;
  readonly trigger: (props: { loading: boolean }) => ReactNode;
  readonly onOpenChange: (value: boolean) => void;
}

function AssignTaskToGroupDialog({ groupId, trigger, open, onOpenChange }: AssignTaskToGroupDialogProps) {
  const { assignToGroup, loading, client } = useTaskAssignToGroupFeature();
  const [isSearchResultBlocked, setIsSearchResultBlocked] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger({ loading })}</DialogTrigger>

      <DialogContent className="p-0 rounded-2xl min-h-0 min-w-0 sm:max-w-200 sm:max-h-100" showCloseButton={false}>
        <AssignableTaskSearch
          loading={loading || isSearchResultBlocked}
          groupId={groupId}
          onTaskSelect={(task) => {
            setIsSearchResultBlocked(true);
            assignToGroup(
              { groupId, taskId: task.id },
              {
                onSuccess: async () => {
                  onOpenChange(false);
                  GroupCacheManager.changeGroupTaskCount(client.cache, { groupId, delta: 1 });
                  await GroupCacheManager.invalidateAssignableTasks(client);
                  await invalidateGroup(client.cache, groupId);
                  setIsSearchResultBlocked(false);
                },
              },
            );
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export { AssignTaskToGroupDialog, type AssignTaskToGroupDialogProps };
