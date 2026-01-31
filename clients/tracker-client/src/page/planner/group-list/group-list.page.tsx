import { useGroupsQuery } from '@/entity/planner/groups';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';
import { GroupListHeader } from './components/group-list-header';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { GroupCart } from './components/group-cart';

/* TODO:
 *   [x] перверстать карточку
 *   [] новая страница для одной группы
 *   [] удаление на отдельной странице группы
 *   ---------------------------------------------
 *   -- закрепленный хедер с действиями --
 *   [x] создание группы
 *   [] поиск по группам
 *   [] сортировка
 *   [] фильтрация
 * */

function GroupListPage() {
  const { groups, isLoading } = useGroupsQuery();
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Группы"
      className="flex flex-col w-full relative grow sm:max-w-[80%] mx-auto pb-10 lg:pb-10 px-0 lg:px-0"
    >
      <GroupListHeader onSearch={console.log} onFilterChange={console.log} />

      <DataLoader isLoading={isLoading}>
        <ul className="flex flex-col w-full gap-3 px-1">
          {groups?.items.map((group) => (
            <GroupCart
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
