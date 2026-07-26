import { useState } from 'react';
import { useNotify } from '@/shared/lib';
import { GroupCacheManager } from '@/shared/transport/graphql';
import { Button, Dialog, DialogContent, DialogTrigger } from '@/shared/ui-kit';
import { useGroupCreate } from './api/use-group-create';
import { GroupForm } from './group-form/group-form';

function GroupCreateDialog() {
  const [open, setOpen] = useState(false);
  const { promise } = useNotify();
  const { createGroup, client, loading: isGroupCreateLoading } = useGroupCreate();

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && isGroupCreateLoading) return;
        setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={isGroupCreateLoading}>Создать группу</Button>
      </DialogTrigger>

      <DialogContent className="p-0" showCloseButton={false}>
        <GroupForm
          loading={isGroupCreateLoading}
          onSubmit={(fromData) => {
            promise(
              createGroup({
                awaitRefetchQueries: true,
                variables: { input: { name: fromData.name } },
                onCompleted: async ({ createGroup: data }) => {
                  if (data.id != null) {
                    setOpen(false);
                    GroupCacheManager.refetchGroupList(client);
                    GroupCacheManager.refetchAssignableGroups(client);
                  }
                },
              }),
            );
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export { GroupCreateDialog };
