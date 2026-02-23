import { useGroupsQuery } from '@/entity/planner/groups';
import { GroupCardSkeleton } from '@/entity/planner/groups/ui';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { InfinityScroll } from '@/shared/components/infinity-scroll';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { routes } from '@/shared/lib/routes';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useNavigate } from 'react-router-dom';
import { useDebounceValue } from 'usehooks-ts';
import { GroupListManipulator } from './components/group-list-manipulator';
import { useGroupListPageUrlQuery } from './lib/use-group-list-page-url-query';

const GroupCard = withLazy(
  () => import('@/entity/planner/groups/ui').then((m) => ({ default: m.GroupCard })),
  <GroupCardSkeleton />,
);

function GroupListPage() {
  const { pageQuery } = useGroupListPageUrlQuery();

  const { groupList, isLoading, isEmpty, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGroupsQuery({
      limit: 10,
      search: useDebounceValue(pageQuery?.search, 400)[0],
    });

  const navigate = useNavigate();
  return (
    <PageWrapper fixContainer title="Группы" className="relative">
      <DataLoader
        parallelMount
        isEmpty={!isLoading && isEmpty}
        isLoading={isLoading}
        emptyElement={<AppEmptyPlaceholder message="Группы не найдены." />}
        loadingElement={
          <div className="flex flex-col gap-3 px-1 pt-2 md:pt-4">
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
          <ul className="flex flex-col w-full gap-3 p-3 pb-10 md:pt-4">
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

      <GroupListManipulator />
    </PageWrapper>
  );
}

export const Component = GroupListPage;
