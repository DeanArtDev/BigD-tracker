import { Check, Folder } from 'lucide-react';
import { DropdownItem } from '@/shared/project-ui';
import { Button, DataLoader, Typography } from '@/shared/ui-kit';
import { GroupId, GroupInfo, useGetAssignableGroups } from '../../model';

interface ListContentProps {
  readonly selectedGroupId?: GroupId;

  readonly onSelect: (group: GroupInfo) => void;
}

function ListContent({ selectedGroupId, onSelect }: ListContentProps) {
  const { groups, loading } = useGetAssignableGroups();

  return (
    <DataLoader isLoading={loading} loadingElement={<DataLoader.Loading size={25} />}>
      {groups.items.map((group) => {
        const isSelected = selectedGroupId === group.id;

        return (
          <DropdownItem key={group.id} asChild>
            <Button
              className="w-full flex justify-start"
              disabled={isSelected}
              variant="ghost"
              size="sm"
              onClick={(evt) => {
                evt.stopPropagation();
                onSelect(group);
              }}
            >
              {isSelected ? <Check /> : <Folder />}
              <Typography.P className="truncate max-w-100">{group.name}</Typography.P>
            </Button>
          </DropdownItem>
        );
      })}
    </DataLoader>
  );
}

export { ListContent };
