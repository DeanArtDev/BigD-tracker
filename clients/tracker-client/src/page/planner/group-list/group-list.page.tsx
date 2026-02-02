import { useGroupsQuery } from '@/entity/planner/groups';
import { GroupCardSkeleton } from '@/entity/planner/groups/ui';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';
import { GroupListHeader } from './components/group-list-header';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';

const GroupCard = withLazy(
  () => import('@/entity/planner/groups/ui').then((m) => ({ default: m.GroupCard })),
  <GroupCardSkeleton />,
);

function GroupListPage() {
  const { groups, isLoading, isEmpty } = useGroupsQuery();
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Группы"
      className="flex flex-col w-full relative grow sm:max-w-[80%] mx-auto pb-10 lg:pb-10 px-0 lg:px-0"
    >
      <GroupListHeader onSearch={console.log} onFilterChange={console.log} />

      <DataLoader
        isEmpty={isEmpty}
        isLoading={isLoading}
        emptyElement={<AppEmptyPlaceholder message="У вас еще нет ни одно группы, создайте." />}
        loadingElement={
          <div className="flex flex-col gap-3 px-1">
            {new Array(12).fill(0).map((_, index) => (
              <GroupCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <ul className="flex flex-col w-full gap-3 px-1">
          {groups?.items.map((group) => (
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
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GroupListPage;
