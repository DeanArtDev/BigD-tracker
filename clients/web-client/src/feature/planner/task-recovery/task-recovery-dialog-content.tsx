import { useState } from 'react';
import { GroupId, GroupTaskIndication } from '@/entity/planner/groups';
import { MaybePromise } from '@/shared/lib';
import { AppSearchInput } from '@/shared/project-ui';
import { useGetAssignableGroups, usePlannerInit } from '@/shared/transport/graphql';
import {
  Button,
  ButtonLoading,
  cn,
  DataLoader,
  RadioGroup,
  RadioGroupItem,
  ScrollAreaNativeVertical,
} from '@/shared/ui-kit';

interface TaskRecoveryDialogContentProps {
  readonly loading: boolean;

  readonly onCancel: () => void;
  readonly onRecover?: (groupId: GroupId) => MaybePromise<void>;
}

function TaskRecoveryDialogContent({ loading, onCancel, onRecover }: TaskRecoveryDialogContentProps) {
  const { data: plannerInit } = usePlannerInit<GroupId>();
  const [selectedGroupId, setSelectedGroupId] = useState<GroupId | undefined>(() => plannerInit?.inbox?.id);
  const [search, setSearch] = useState<string>();

  const { groups, initialLoading: isGroupsLoading, isError: isGroupsError } = useGetAssignableGroups<GroupId>();

  const normalizedSearch = search?.trim().toLocaleLowerCase();
  const filteredGroups = groups.items.filter(
    (group) => normalizedSearch == null || group.name.toLocaleLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="flex flex-col grow gap-3 pb-4">
      <AppSearchInput
        className="mx-4 w-auto"
        placeholder="Поиск группы…"
        onSearch={(value) => {
          setSearch(value);
        }}
      />

      <ul className="h-[280px] px-4 flex max-w-full grow">
        <DataLoader isLoading={isGroupsLoading} loadingElement={<DataLoader.Loading size={30} />}>
          <ScrollAreaNativeVertical>
            {filteredGroups.length > 0 ? (
              <RadioGroup
                className="gap-1 w-full"
                disabled={loading}
                value={selectedGroupId?.toString()}
                onValueChange={(value) => {
                  setSelectedGroupId(Number(value) as GroupId);
                }}
              >
                {filteredGroups.map((group) => {
                  const isSelected = group.id === selectedGroupId;

                  return (
                    <label
                      className={cn(
                        'flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-muted',
                        isSelected && 'bg-primary/10 hover:bg-primary/10',
                      )}
                      htmlFor={`task-recovery-group-${group.id}`}
                      key={group.id}
                    >
                      <GroupTaskIndication groupId={group.id} />

                      <span className="min-w-0 grow line-clamp-1">{group.name}</span>

                      <RadioGroupItem
                        id={`task-recovery-group-${group.id}`}
                        value={group.id.toString()}
                        aria-label={group.name}
                      />
                    </label>
                  );
                })}
              </RadioGroup>
            ) : (
              <p className="py-5 text-center text-sm text-muted-foreground">Группы не найдены</p>
            )}
          </ScrollAreaNativeVertical>
        </DataLoader>
      </ul>

      <div className="flex justify-end gap-2 border-t p-2">
        <Button variant="outline" disabled={loading} onClick={onCancel}>
          Отмена
        </Button>

        <ButtonLoading
          loading={loading}
          disabled={selectedGroupId == null || isGroupsError}
          onClick={async () => {
            if (selectedGroupId == null) return;
            await onRecover?.(selectedGroupId);
          }}
        >
          {loading ? 'Восстанавливаем…' : 'Восстановить'}
        </ButtonLoading>
      </div>
    </div>
  );
}

export { TaskRecoveryDialogContent };
