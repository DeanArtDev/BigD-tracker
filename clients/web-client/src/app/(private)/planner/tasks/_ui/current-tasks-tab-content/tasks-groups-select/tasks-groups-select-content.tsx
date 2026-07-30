import { Folder, Inbox } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { useGetAssignableGroups, usePlannerInit } from '@/shared/transport/graphql';
import {
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DataLoader,
} from '@/shared/ui-kit';
import { useGetTasksPerPageCurrent } from '../../../_model/use-get-tasks-per-page-current';

function TasksGroupsSelectContent() {
  const { selectedGroupIds, setSearchQuery } = useGetTasksPerPageCurrent();

  const { groups, loading } = useGetAssignableGroups<GroupId>();
  const availableGroups = groups.items;

  const selectedGroupIdsSet = new Set(selectedGroupIds);

  const { data } = usePlannerInit<GroupId>();
  const inboxId = data?.inbox.id;

  const toggleGroup = (groupId: GroupId) => {
    let buffer: GroupId[] = [...selectedGroupIds];

    if (selectedGroupIdsSet.has(groupId)) {
      buffer = buffer.filter((id) => id !== groupId);
    } else {
      if (groupId == inboxId) {
        buffer.unshift(groupId);
      } else {
        buffer.push(groupId);
      }
    }

    setSearchQuery((previousQuery) => ({ ...previousQuery, groupIds: buffer }));
  };

  const hasSelectedGroups = selectedGroupIds.length > 0;
  const hasAvailableGroups = availableGroups.length > 0;
  const hasBothTypeOfGroups = hasSelectedGroups && hasAvailableGroups;
  const allGroupSelected = selectedGroupIds.length === availableGroups.length;

  return (
    <Command className="p-0">
      <CommandInput className="p-0" placeholder="Поиск группы…" />

      <CommandList>
        <DataLoader isLoading={loading} loadingElement={<DataLoader.Loading className="my-5" size={24} />}>
          <CommandEmpty>Группы не найдены</CommandEmpty>

          {hasSelectedGroups && (
            <CommandGroup
              heading="Выбрано"
              className="**:[[cmdk-group-items]]:flex **:[[cmdk-group-items]]:flex-col **:[[cmdk-group-items]]:gap-1"
            >
              {selectedGroupIds.map((id) => {
                const group = groups.byId[id];
                if (group == null) return null;
                const isInbox = group.id === inboxId;
                return (
                  <Item
                    key={group.id}
                    selected
                    isInbox={isInbox}
                    name={group.name}
                    onSelect={() => {
                      toggleGroup(group.id);
                    }}
                  />
                );
              })}
            </CommandGroup>
          )}

          {hasBothTypeOfGroups && !allGroupSelected && <CommandSeparator />}

          {hasAvailableGroups && !allGroupSelected && (
            <CommandGroup heading="Все группы">
              {availableGroups.map((group) => {
                if (selectedGroupIdsSet.has(group.id)) return null;
                const isInbox = group.id === inboxId;

                return (
                  <Item
                    isInbox={isInbox}
                    selected={false}
                    key={group.id}
                    name={group.name}
                    onSelect={() => {
                      toggleGroup(group.id);
                    }}
                  />
                );
              })}
            </CommandGroup>
          )}
        </DataLoader>
      </CommandList>
    </Command>
  );
}

function Item({
  selected,
  name,
  isInbox = false,
  onSelect,
}: {
  selected: boolean;
  isInbox?: boolean;
  name: string;
  onSelect: () => void;
}) {
  return (
    <CommandItem className={cn([selected && 'bg-accent'])} data-checked={selected} value={name} onSelect={onSelect}>
      {isInbox ? <Inbox /> : <Folder />}
      {name}
    </CommandItem>
  );
}

export { TasksGroupsSelectContent };
