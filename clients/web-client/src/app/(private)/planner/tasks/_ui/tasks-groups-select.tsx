'use client';

import { ChevronsUpDown, Folder, FolderSearch, Inbox } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { useGetAssignableGroups, usePlannerInit } from '@/shared/transport/graphql';
import {
  Badge,
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DataLoader,
  FilterResetButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui-kit';
import { useTasksTabUrlQuery } from '../_model/use-tasks-url-query';

function TasksGroupsSelect() {
  const [searchQuery, setSearchQuery] = useTasksTabUrlQuery('current');
  const selectedGroupIds = (searchQuery?.groupIds ?? []) as GroupId[];
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
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button type="button" variant="outline" className="text-muted-foreground">
            <FolderSearch />
            Группы
            <ChevronsUpDown className="text-muted-foreground" />
          </Button>

          {hasSelectedGroups && (
            <div className="group absolute -top-2.5 -right-2.5 flex size-5 items-center justify-center">
              <FilterResetButton
                className="hidden group-hover:flex"
                onReset={() => {
                  setSearchQuery((previousQuery) => ({
                    ...previousQuery,
                    groupIds: undefined,
                  }));
                }}
              />

              <Badge className="size-5 rounded-xl p-0 group-hover:hidden">{selectedGroupIds.length}</Badge>
            </div>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[330px] p-1" align="end">
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
      </PopoverContent>
    </Popover>
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

export { TasksGroupsSelect };
