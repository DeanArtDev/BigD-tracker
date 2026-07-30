import { CircleAlert } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { useGetAssignableGroups } from '@/shared/transport/graphql';
import { Badge, DataLoader, Typography } from '@/shared/ui-kit';

function GroupLabelBadge({ groupId }: { groupId?: GroupId }) {
  const { groups, loading, isError } = useGetAssignableGroups<GroupId>();
  const group = groupId != null ? groups.byId[groupId] : undefined;

  return (
    <div className="grid grid-cols-[max-content_1fr] gap-2 items-center">
      <Typography.H6 className="font-medium">Группа:</Typography.H6>

      <DataLoader
        isLoading={loading}
        isError={isError}
        errorElement={<CircleAlert className="stroke-destructive size-4" />}
        loadingElement={<DataLoader.Loading size={15} className="m-0" />}
      >
        <Badge variant="outline" className="max-w-full bg-background h-fut justify-start">
          <span className="truncate">{group?.name}</span>
        </Badge>
      </DataLoader>
    </div>
  );
}

export { GroupLabelBadge };
