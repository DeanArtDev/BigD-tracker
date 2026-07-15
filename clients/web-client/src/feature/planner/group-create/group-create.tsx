import { useState } from 'react';
import { invalidateGroupList, useGroupCreate } from '@/entity/planner/groups';
import { useNotify } from '@/shared/lib';
import { Button, Dialog, DialogContent, DialogTrigger } from '@/shared/ui-kit';
import { GroupForm } from './group-form/group-form';

function GroupCreate() {
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
              async () =>
                await createGroup({
                  awaitRefetchQueries: true,
                  variables: { input: { name: fromData.name } },
                  onCompleted: async ({ createGroup: data }) => {
                    if (data.id != null) {
                      setOpen(false);
                      await invalidateGroupList(client);
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

export { GroupCreate };
