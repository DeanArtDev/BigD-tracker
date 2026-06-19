import { Button } from '@/shared/ui-kit';
import { GroupId, GroupInfo } from '../model';

interface GroupInfoListProps {
  readonly selectedGroupIds: GroupId[];
  readonly groups: GroupInfo[];
  readonly onGroupClick?: (group: GroupInfo) => void;
}

function GroupInfoList({ groups, selectedGroupIds, onGroupClick }: GroupInfoListProps) {
  return (
    <ul className="group-info-list p-2 grow flex flex-col gap-2">
      {groups.map((group) => (
        <li key={group.id}>
          <Button
            className="grid grid-cols-[1fr_min-content] gap-2 grow w-full"
            variant={selectedGroupIds.includes(group.id) ? 'default' : 'outline'}
            onClick={(evt) => {
              if (selectedGroupIds.includes(group.id)) return;
              evt.stopPropagation();
              onGroupClick?.(group);
            }}
          >
            <span className="truncate text-left">{group.name}</span>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export { GroupInfoList, type GroupInfoListProps };
