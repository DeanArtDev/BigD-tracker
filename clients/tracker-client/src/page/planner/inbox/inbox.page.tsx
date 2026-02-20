import { useGetUserInbox } from '@/entity/planner/groups';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { TaskInboxList } from './components/inbox-list';
import { TaskInboxCreateController } from './components/task-inbox-create-controller';

function InboxPage() {
  const { isLoading, isEmpty } = useGetUserInbox();

  return (
    <PageWrapper fixContainer title="IN BOX">
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
