import { useGroupsQuery } from '@/entity/planner/groups';
import { GroupCardSkeleton } from '@/entity/planner/groups/ui';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { InfinityScroll } from '@/shared/components/infinity-scroll';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { routes } from '@/shared/lib/routes';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupListHeader } from './components/group-list-header';

const GroupCard = withLazy(
  () => import('@/entity/planner/groups/ui').then((m) => ({ default: m.GroupCard })),
  <GroupCardSkeleton />,
);

function GroupListPage() {
  const [groupSearch, setGroupSearch] = useState<string | undefined>(undefined);

  const { groupList, isLoading, isEmpty, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGroupsQuery({
      limit: 10,
      search: groupSearch,
    });

  const navigate = useNavigate();
  return (
    <PageWrapper fixContainer title="Группы" className="relative">
      <GroupListHeader onSearch={setGroupSearch} />

      <DataLoader
        parallelMount
        isEmpty={!isLoading && isEmpty}
        isLoading={isLoading}
        emptyElement={<AppEmptyPlaceholder message="Группы не найдены." />}
        loadingElement={
          <div className="flex flex-col gap-3 px-1">
            {new Array(12).fill(0).map((_, index) => (
              <GroupCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <InfinityScroll
          hasNextPage={hasNextPage}
          isLoadingNextPage={isFetchingNextPage}
          onNextPageLoad={fetchNextPage}
        >
          <ul className="flex flex-col w-full gap-3 px-1 pb-20 md:pb-30">
            {groupList?.map((group) => (
              <GroupCard
                key={group.id}
                name={group.name}
                status={group.status}
                tasks={group.tasks}
                progress={group.progress}
                onClick={() => void navigate(routes.plannerGroup.link({ groupId: group.id }))}
              />
            ))}
          </ul>
        </InfinityScroll>
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GroupListPage;
