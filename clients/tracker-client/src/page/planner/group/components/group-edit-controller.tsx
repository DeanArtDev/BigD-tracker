import { type GroupEntity, isAllowGroupDelete, useGroupUpdate, useInvalidateAllGroups } from '@/entity/planner/groups';
import { GroupConfirmedDelete } from '@/entity/planner/groups/ui';
import { AppTooltip } from '@/shared/components/app-tooltip';
import { ButtonTrash } from '@/shared/components/button-trash';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';
import { GroupEditForm } from './form/group-edit-form';

interface GroupEditControllerProps {
  readonly group: GroupEntity;
}

function GroupEditController({ group }: GroupEditControllerProps) {
  const { updateGroup, isPending } = useGroupUpdate();
  const invalidateAllGroups = useInvalidateAllGroups();
  const navigate = useNavigate();

  const isNotAllowGroupDelete = !isAllowGroupDelete(group);

  return (
    <GroupEditForm
      group={group}
      loading={isPending}
      footerSlot={
        <GroupConfirmedDelete
          groupId={group.id}
          onSuccess={async () => {
            await navigate(routes.plannerGroupList.path);
            await invalidateAllGroups();
          }}
        >
          {({ isLoading, onDelete }) => (
            <AppTooltip content="Нельзя удалить пока содержит дела" disable={!isNotAllowGroupDelete}>
              <ButtonTrash disabled={isNotAllowGroupDelete} variant="ghost" isLoading={isLoading} onClick={onDelete} />
            </AppTooltip>
          )}
        </GroupConfirmedDelete>
      }
      onSubmit={(formData, { reset }) => {
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
              await invalidateAllGroups();
              reset();
            },
          },
        );
      }}
    />
  );
}

export { GroupEditController, type GroupEditControllerProps };
