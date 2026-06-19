import { useState } from 'react';
import { MaybePromise } from '@/shared/lib';
import {
  Button,
  ButtonLoading,
  DataErrorElement,
  DataLoader,
  DialogFooter,
  ScrollAreaNativeVertical,
} from '@/shared/ui-kit';
import { GroupId, GroupInfo, useGetAssignableGroups } from '../../model';
import { GroupInfoList } from '../group-info-list';

interface GroupListProps {
  readonly selectedGroupIds?: GroupId[];
  readonly onCancel: () => void;
  readonly onAccept: (groups: GroupInfo[]) => MaybePromise<void>;
}

function GroupList({ selectedGroupIds = [], onAccept, onCancel }: GroupListProps) {
  const [selectedIds, setSelectedIds] = useState<GroupId[]>(selectedGroupIds);
  const [selectedGroups, setSelectedGroups] = useState<GroupInfo[]>([]);

  const { groups, isError, loading: isGetAssignableGroupsLoading, refetch } = useGetAssignableGroups();
  const [loading, setLoading] = useState(false);

  return (
    <DataLoader
      isError={isError}
      isLoading={isGetAssignableGroupsLoading}
      errorElement={<DataErrorElement size="full" variant="transparent" onRetry={refetch} />}
    >
      <div className="flex flex-col grow gap-2 min-h-0">
        <ScrollAreaNativeVertical className="grow">
          <GroupInfoList
            groups={groups}
            selectedGroupIds={selectedIds}
            onGroupClick={(groupsInfo) => {
              if (loading) return;
              setSelectedGroups([groupsInfo]);
              setSelectedIds([groupsInfo.id]);
            }}
          />
        </ScrollAreaNativeVertical>

        <DialogFooter className="m-0 mt-auto">
          <Button className="mr-auto" disabled={loading} variant="ghost" onClick={onCancel}>
            Закрыть
          </Button>

          <ButtonLoading
            loading={loading}
            disabled={selectedGroups.length <= 0}
            onClick={async () => {
              if (selectedGroups.length <= 0) return;
              try {
                setLoading(true);
                await onAccept(selectedGroups);
              } finally {
                setLoading(false);
              }
            }}
          >
            Сохранить
          </ButtonLoading>
        </DialogFooter>
      </div>
    </DataLoader>
  );
}

export { GroupList, type GroupListProps };
