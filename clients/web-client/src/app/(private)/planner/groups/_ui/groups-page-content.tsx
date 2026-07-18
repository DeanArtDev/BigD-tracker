'use client';

import { GroupCreate } from '@/feature/planner/group-create';
import { DataLoader, Typography } from '@/shared/ui-kit';
import { GroupList } from './group-list';
import { GroupPageSearch } from './group-page-search';
import { useGetGroupListByUrlQuery } from '../_model/use-get-group-list-by-url-query';

function GroupsPageContent() {
  const { hasSearch, isEmpty } = useGetGroupListByUrlQuery();
  const isEmptyAndNoSearch = isEmpty && !hasSearch;

  return (
    <div className="grow grid grid-rows-[min-content_max-content_1fr] min-h-0 min-w-0 gap-3 px-8 py-5">
      <div className="grid grid-cols-[1fr_min-content] gap-2">
        <Typography.H2>Группы</Typography.H2>

        {!isEmptyAndNoSearch && <GroupCreate />}
      </div>

      <DataLoader
        isEmpty={isEmptyAndNoSearch}
        emptyElement={
          <DataLoader.Empty
            title="Тут пока тихо. Накидай что-нибудь!"
            description={isEmptyAndNoSearch && <GroupCreate />}
          />
        }
      >
        <GroupPageSearch />

        <GroupList />
      </DataLoader>
    </div>
  );
}

export { GroupsPageContent };
