import { useWatch } from 'react-hook-form';
import { useGetAssignableGroups } from '@/entity/planner/groups';
import { TaskFormData } from '@/entity/planner/tasks';
import { Badge, DataLoader, Typography } from '@/shared/ui-kit';

function Group() {
  const groupId = useWatch<{ groupId: TaskFormData['groupId'] }>({ name: 'groupId' });
  const { groups, loading } = useGetAssignableGroups();

  const groupName = groups.items.find((g) => g.id === groupId)?.name ?? 'Нет группы';
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-2 items-center">
      <Typography.H6 className="font-medium">Группа:</Typography.H6>

      <DataLoader isLoading={loading} loadingElement={<DataLoader.Loading size={15} className="m-0" />}>
        <Badge variant="outline" className="max-w-full bg-background h-fut justify-start">
          <span className="truncate">{groupName}</span>
        </Badge>
      </DataLoader>
    </div>
  );
}

export { Group };
