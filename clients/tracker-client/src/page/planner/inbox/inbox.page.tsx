import { useInboxQuery } from '@/entity/planner/groups';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { AddThingIntoInbox } from './components/add-thing-into-inbox';
import { InboxList } from './components/inbox-list';

function InboxPage() {
  const { isLoading } = useInboxQuery();

  return (
    <PageWrapper className="flex flex-col w-full grow sm:max-w-[80%] mx-auto" title="IN BOX">
      <DataLoader loadingElement={<AppLoader />} isLoading={isLoading}>
        <InboxList />
      </DataLoader>

      <AddThingIntoInbox />
    </PageWrapper>
  );
}

export const Component = InboxPage;
