import { Folder } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { pluralize } from '@/shared/lib/pluralize';
import { useGetGroupById } from '@/shared/transport/graphql';
import { Badge, DataLoader } from '@/shared/ui-kit';

interface GroupTaskCountProps {
  readonly groupId: GroupId;
}

function GroupTaskCount({ groupId }: GroupTaskCountProps) {
  const { groupById, loading } = useGetGroupById<GroupId>({ groupId });

  const count = groupById?.taskCount ?? 0;

  return (
    <Badge variant="outline" className="h-7 rounded-md">
      <Folder />

      <DataLoader loadingElement={<DataLoader.Loading size={20} />} isLoading={loading}>
        {`${count} ${pluralize(count, { one: 'дело', many: 'дел', few: 'дел' })} в группе`}
      </DataLoader>
    </Badge>
  );
}

export { GroupTaskCount, type GroupTaskCountProps };
