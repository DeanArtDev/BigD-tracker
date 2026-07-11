'use client';

import { DataLoader, Typography } from '@/shared/ui-kit';
import { InboxManipulationBlock } from './inbox-manipulation-block';
import { InboxTaskList } from './inbox-task-list';
import { useInboxQueryByUrlQuery } from '../_model/use-inbox-query-by-url-query';

function InboxPageContent() {
  const { isEmpty, initialLoading } = useInboxQueryByUrlQuery();

  return (
    <div className="grow grid grid-rows-[min-content_max-content_1fr] min-h-0 min-w-0 gap-3 px-8 py-5">
      <Typography.H2>INBOX</Typography.H2>

      <DataLoader
        isEmpty={isEmpty && initialLoading}
        emptyElement={
          <DataLoader.Empty
            title="Тут пока тихо. Накидай что-нибудь!"
            description="Нажми + в шапке, чтобы добавить первую задачу."
          />
        }
      >
        <InboxManipulationBlock />

        <InboxTaskList />
      </DataLoader>
    </div>
  );
}

export { InboxPageContent };
