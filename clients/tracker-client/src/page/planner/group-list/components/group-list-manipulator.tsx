import { GroupCreation } from '@/feature/planner/groups/group-creation';
import { useGroupListPageUrlQuery } from '../lib/use-group-list-page-url-query';
import { AppManipulatorContainer } from '@/shared/components/app-manipulator-container';
import { ButtonAdd } from '@/shared/components/button-add';
import { ManipulatorSearch } from '@/shared/components/manipulator-search';
import { useState } from 'react';

function GroupListManipulator() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { pageQuery, setPageQuery } = useGroupListPageUrlQuery();

  return (
    <AppManipulatorContainer
      items={[
        {
          key: 'add-group',
          element: (
            <GroupCreation>
              <ButtonAdd size="icon-lg" iconProps={{ className: 'size-6' }} />
            </GroupCreation>
          ),
        },
        searchOpen ? { key: '1', element: <div className="w-[56px]" /> } : null,
        searchOpen ? { key: '2', element: <div className="w-[56px]" /> } : null,
        searchOpen ? { key: '3', element: <div className="w-[56px]" /> } : null,
        searchOpen ? { key: '4', element: <div className="w-[56px]" /> } : null,
        {
          key: 'search',
          element: (
            <ManipulatorSearch
              open={searchOpen}
              placeholder="Поиск по группам"
              className="inset-1.5 w-[calc(100%-56px)]"
              search={pageQuery?.search}
              onOpenChange={setSearchOpen}
              onSearchChange={(search) => {
                setPageQuery((prev) => ({ ...prev, search }));
              }}
            />
          ),
        },
      ].filter(Boolean)}
    />
  );
}

export { GroupListManipulator };
