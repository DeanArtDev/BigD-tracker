import { useGroupCreate, useGroupInvalidate } from '@/entity/planner/groups';
import { GroupFormDialog } from '@/entity/planner/groups/ui/form';
import { type PropsWithChildren, useState } from 'react';

interface GroupCreationProps extends PropsWithChildren {
  readonly onSuccess?: () => void;
  readonly onCansel?: () => void;
}

function GroupCreation({ children, onCansel, onSuccess }: GroupCreationProps) {
  const [open, setOpen] = useState(false);

  const { createGroup, isPending } = useGroupCreate();
  const groupInvalidate = useGroupInvalidate();

  return (
    <GroupFormDialog
      open={open}
      loading={isPending}
      trigger={children}
      onOpenChange={(value) => {
        setOpen(value);
        !value && onCansel?.();
      }}
      onSubmit={(formData) => {
        createGroup(
          {
            body: {
              data: {
                name: formData.name,
                description: formData.description,
              },
            },
          },

          {
            onSuccess: async () => {
              await groupInvalidate();
              setOpen(false);
              onSuccess?.();
            },
          },
        );
      }}
    />
  );
}

export { GroupCreation };
