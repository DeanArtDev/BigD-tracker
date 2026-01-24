import { useGetUserInbox } from '@/entity/planner/groups';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppPlaceholder } from '@/shared/components/app-placeholder';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { TaskInboxCreateController } from './components/task-inbox-create-controller';
import { InboxList } from './components/inbox-list';

/**
 * TODO:
 * [x] нарисовать заглушку когда нет дел
 * [x] интегрировать запрос дел в inbox
 * [x] создание дела для inbox в отдельной форме
 * [] редактирование дела для inbox в отдельной форме
 * [] воткнуть визивик в создание дела для inbox
 * [] переписать хуки model
 * [] удаление дела из inbox
 * [] удалить date-fns
 * [] react-textarea-autosize нужна ли вообще??
 * []
 * []
 * []
 * */

function InboxPage() {
  const { isLoading, isEmpty } = useGetUserInbox();

  return (
    <PageWrapper className="flex flex-col w-full grow sm:max-w-[80%] mx-auto" title="IN BOX">
      <DataLoader
        isEmpty={isEmpty}
        emptyElement={<AppPlaceholder message="Дела отсутствуют" />}
        isLoading={isLoading}
        loadingElement={<AppLoader />}
      >
        <InboxList />
      </DataLoader>

      <TaskInboxCreateController />
    </PageWrapper>
  );
}

export const Component = InboxPage;
