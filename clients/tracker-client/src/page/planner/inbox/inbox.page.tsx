import { useGetUserInbox } from '@/entity/planner/groups';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { TaskInboxCreateController } from './components/task-inbox-create-controller';
import { TaskInboxList } from './components/inbox-list';

function InboxPage() {
  const { isLoading, isEmpty } = useGetUserInbox();

  return (
    <PageWrapper className="flex flex-col w-full grow sm:max-w-[80%] mx-auto" title="IN BOX">
      <DataLoader
        isEmpty={isEmpty}
        emptyElement={<AppEmptyPlaceholder message="Дела отсутствуют" />}
        isLoading={isLoading}
        loadingElement={<AppLoader />}
      >
        <TaskInboxList />
      </DataLoader>

      <TaskInboxCreateController />
    </PageWrapper>
  );
}

export const Component = InboxPage;
