import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GroupActionsDropdown, GroupId, GroupNameEditor } from '@/entity/planner/groups';
import { useGroupDeleteFeature } from '@/feature/planner/group-delete';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { routes } from '@/shared/routes';
import { Typography } from '@/shared/ui-kit';

interface GroupNameProps {
  readonly id: GroupId;
  readonly name: string;
}

function GroupName({ id, name }: GroupNameProps) {
  const [isEdit, setIsEdit] = useState(false);

  const router = useRouter();

  const { isGroupUpdateLoading, updateGroup } = useGroupUpdateFeature();
  const { isGroupDeleteLoading, deleteGroup } = useGroupDeleteFeature();

  return (
    <div className="flex grow gap-2 justify-between items-center">
      <Typography.H1 className="w-full line-clamp-2 pl-1 text-2xl text-left">
        <GroupNameEditor
          isEdit={isEdit}
          name={name}
          loading={isGroupUpdateLoading}
          onIsEditChange={setIsEdit}
          onNameChange={(name) => void updateGroup({ name, id, description: undefined, taskIds: undefined })}
        />
      </Typography.H1>

      {!isEdit && (
        <GroupActionsDropdown
          loading={isGroupUpdateLoading || isGroupDeleteLoading}
          onDelete={() =>
            deleteGroup(id, {
              onSuccess: () => {
                router.replace(routes.plannerGroupList.path);
              },
            })
          }
          onNameEdit={() => void setIsEdit(true)}
        />
      )}
    </div>
  );
}

export { GroupName, type GroupNameProps };
