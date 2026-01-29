import { useGroupsQuery } from '@/entity/planner/groups';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { GroupAdd } from './components/group-add';
import { GroupCart } from './components/group-cart';

/* TODO:
 *   [] перверстать карточку
 *   [] новая страница для одной группы
 *   [] удаление на отдельной странице группы
 *   ---------------------------------------------
 *   -- закрепленный хедер с действиями --
 *   [] поиск по группам
 *   [] сортировка
 *   [] фильтрация
 *   [] создание группы
 * */

function GroupListPage() {
  const { groups, isLoading } = useGroupsQuery();

  return (
    <PageWrapper
      title="Группы"
      className="flex flex-col w-full grow sm:max-w-[80%] mx-auto gap-6 pb-10"
    >
      <DataLoader loadingElement={<AppLoader />} isLoading={isLoading}>
        <ul className="flex flex-col w-full gap-3">
          {groups?.map((group) => (
            <GroupCart
              key={group.id}
              name={group.name}
              status={group.status}
              tasks={group.tasks}
              progress={group.progress}
              onClick={() => console.log(group.id)}
            />
          ))}
        </ul>

        <GroupAdd />
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GroupListPage;
