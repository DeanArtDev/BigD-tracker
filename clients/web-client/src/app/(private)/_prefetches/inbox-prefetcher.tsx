import { PropsWithChildren, Suspense } from 'react';
import { GetInboxDocument } from '@/entity/planner/inbox';
import { PreloadQuery } from '@/shared/transport/graphql/server';
import { DataLoadingElement } from '@/shared/ui-kit';

function InboxPrefetcher({ children }: PropsWithChildren) {
  return (
    <PreloadQuery query={GetInboxDocument} context={{ endpoint: 'private' }}>
      <Suspense fallback={<DataLoadingElement />}>{children}</Suspense>
    </PreloadQuery>
  );
}

export { InboxPrefetcher };
