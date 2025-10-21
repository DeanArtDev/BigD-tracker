import { useGroupCreate, useGroupInvalidate } from '@/entity/planner/groups';
import { useState } from 'react';
import { GroupAddForm } from './group-add-form';
import { GroupAddButton } from './group-add-button';

function GroupAdd() {
  const [edit, setEdit] = useState(false);
  const { create, isPending } = useGroupCreate();
  const groupInvalidate = useGroupInvalidate();

  return (
    <div>
      <GroupAddButton onClick={() => void setEdit(true)} />
      {edit && (
        <GroupAddForm
          isLoading={isPending}
          onSubmit={(formResult) => {
            create(
              { body: { data: { ...formResult, things: [] } } },
              {
                onSuccess: async () => {
                  await groupInvalidate();
                  setEdit(false);
                },
              },
            );
          }}
          onCancel={() => void setEdit(false)}
        />
      )}
    </div>
  );
}

export { GroupAdd };
