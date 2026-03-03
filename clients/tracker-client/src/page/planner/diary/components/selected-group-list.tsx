import { type GroupInfoEntity, useGroupsAssignableQuery } from '@/entity/planner/groups';
import { AssignableGroupItem } from '@/entity/planner/groups/ui';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { isStringIncludesSearch, useEndToEndSearch } from '@/shared/lib/react/use-end-to-end-search';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit/ui/input-group';
import { ScrollAreaNativeVertical } from '@/shared/ui-kit/ui/scroll-area-native-vertical';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { cn } from '@/shared/ui-kit/utils';
import { keyBy } from 'lodash-es';
import { Check, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useDiaryPageUrlQuery } from '../lib/use-diary-page-url-query';

function SelectedGroupList(props: { className?: string }) {
  const { pageQuery, setPageQuery } = useDiaryPageUrlQuery();
  const { infoGroups = [], isLoading: isGroupAssignableLoading } = useGroupsAssignableQuery();

  const { foundData, handleSearchChange } = useEndToEndSearch<GroupInfoEntity>({
    data: infoGroups,
    predicates: {
      name: isStringIncludesSearch,
    },
  });

  const selectedGroupIdsMap = useMemo(() => {
    return keyBy(pageQuery?.filter?.group ?? []);
  }, [pageQuery?.filter?.group]);

  return (
    <div className={cn('selected-group-list flex flex-col grow gap-2 min-h-0', props.className)}>
      <div>
        <InputGroup>
          <InputGroupInput
            tabIndex={-1}
            placeholder="Поиск по группам"
            onChange={(evt) => {
              handleSearchChange(evt.target.value.trim());
            }}
          />

          <InputGroupAddon align="inline-end">
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Separator />

      <ScrollAreaNativeVertical>
        <DataLoader
          isLoading={isGroupAssignableLoading}
          isEmpty={foundData.length <= 0}
          emptyElement={<AppEmptyPlaceholder size="small" message="Группы не найдены." />}
        >
          <ul className="flex flex-col grow min-w-0 gap-2">
            {foundData.map((groupIndo) => {
              const isSelected = selectedGroupIdsMap[groupIndo?.id] != null;

              return (
                <AssignableGroupItem
                  key={groupIndo.id}
                  item={groupIndo}
                  actionSlot={isSelected && <Check className="size-4 stroke-3" />}
                  onClick={() => {
                    setPageQuery((prev) => {
                      let group = prev?.filter?.group ?? [];
                      if (isSelected) {
                        group = group.filter((i) => i !== groupIndo.id);
                      } else {
                        group.push(groupIndo.id);
                      }

                      return { ...prev, filter: { ...prev.filter, group } };
                    });
                  }}
                />
              );
            })}
          </ul>
        </DataLoader>
      </ScrollAreaNativeVertical>
    </div>
  );
}

export { SelectedGroupList };
