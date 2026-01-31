import { type GroupEntity, useGroupInvalidate, useGroupUpdate } from '@/entity/planner/groups';
import { GroupEditForm } from './form/group-edit-form';

interface GroupEditControllerProps {
  readonly group: GroupEntity;
}

function GroupEditController({ group }: GroupEditControllerProps) {
  const { updateGroup, isPending } = useGroupUpdate();
  const groupInvalidate = useGroupInvalidate();

  return (
    <GroupEditForm
      group={group}
      loading={isPending}
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
