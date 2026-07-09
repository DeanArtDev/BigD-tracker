import { useWatch } from 'react-hook-form';
import { useGetAssignableGroups } from '@/entity/planner/groups';
import { TaskFormData } from '@/entity/planner/tasks';
import { Badge, DataLoader, DataLoadingElement, Typography } from '@/shared/ui-kit';

function Group() {
  const groupId = useWatch<{ groupId: TaskFormData['groupId'] }>({ name: 'groupId' });
  const { groups, loading } = useGetAssignableGroups();

  const groupName = groups.find((g) => g.id === groupId)?.name ?? 'Нет группы';
  return (
    <div className="flex gap-2 items-center">
      <Typography.H6 className="font-medium">Группа:</Typography.H6>

      <DataLoader isLoading={loading} loadingElement={<DataLoadingElement size={15} className="m-0" />}>
        <Badge variant="outline" className="h-fit bg-background">
          {groupName}
        </Badge>
      </DataLoader>
    </div>
  );
}

export { Group };
