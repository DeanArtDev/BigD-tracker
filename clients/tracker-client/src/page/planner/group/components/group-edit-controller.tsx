import { type GroupEntity, useGroupInvalidate, useGroupUpdate } from '@/entity/planner/groups';
import { GroupConfirmedDelete } from '@/entity/planner/groups/ui';
import { ButtonTrash } from '@/shared/components/button-trash';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';
import { GroupEditForm } from './form/group-edit-form';

interface GroupEditControllerProps {
  readonly group: GroupEntity;
}

function GroupEditController({ group }: GroupEditControllerProps) {
  const { updateGroup, isPending } = useGroupUpdate();
  const groupInvalidate = useGroupInvalidate();
  const navigate = useNavigate();

  return (
    <GroupEditForm
      group={group}
      loading={isPending}
      footerSlot={
        <GroupConfirmedDelete
          groupId={group.id}
          onSuccess={() => void navigate(routes.plannerGroupList.path)}
        >
          {({ isLoading }) => <ButtonTrash variant="ghost" isLoading={isLoading} />}
        </GroupConfirmedDelete>
      }
      onSubmit={(formData) => {
        if (group == null) return;

        const tasks = formData.tasks.map((task) => ({
          ...task,
          priority: Number(task.priority),
        }));

        updateGroup(
          {
            params: { path: { groupId: group.id } },
            body: {
              data: {
                name: formData.name,
                description: formData.description,
                tasks,
              },
            },
          },
          {
            onSuccess: async () => {
              await groupInvalidate();
            },
          },
        );
      }}
    />
  );
}

export { GroupEditController, type GroupEditControllerProps };
