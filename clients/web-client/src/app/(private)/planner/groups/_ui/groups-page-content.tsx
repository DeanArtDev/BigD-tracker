'use client';

import { DataLoader, Typography } from '@/shared/ui-kit';
import { GroupList } from './group-list';
import { GroupPageSearch } from './group-page-search';
import { useGetGroupListByUrlQuery } from '../_model/use-get-group-list-by-url-query';

function GroupsPageContent() {
  const { initialLoading, isEmpty } = useGetGroupListByUrlQuery();

  return (
    <div className="grow grid grid-rows-[min-content_max-content_1fr] min-h-0 min-w-0 gap-3 px-8 py-5">
      <Typography.H2>Группы</Typography.H2>

      <DataLoader
        isEmpty={isEmpty && initialLoading}
        emptyElement={
          <DataLoader.Empty
            title="Тут пока тихо. Накидай что-нибудь!"
            description="Нажми + чтобы добавить первую группу."
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
