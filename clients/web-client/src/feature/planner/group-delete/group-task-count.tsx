import { Folder } from 'lucide-react';
import { GroupId, useGetGroupById } from '@/entity/planner/groups';
import { pluralize } from '@/shared/lib/pluralize';
import { Badge, DataLoader } from '@/shared/ui-kit';

interface GroupTaskCountProps {
  readonly groupId: GroupId;
}

function GroupTaskCount({ groupId }: GroupTaskCountProps) {
  const { groupById, loading } = useGetGroupById({ groupId });

  const count = groupById?.taskCount ?? 0;

  return (
    <DataLoader loadingElement={<DataLoader.Loading size={20} />} isLoading={loading}>
      {groupById != null && (
        <Badge variant="outline" className="h-7 rounded-md">
          <Folder />

          {`${count} ${pluralize(count, { one: 'дело', many: 'дел', few: 'дел' })} в группе`}
        </Badge>
      )}
    </DataLoader>
  );
}

export { GroupTaskCount, type GroupTaskCountProps };
