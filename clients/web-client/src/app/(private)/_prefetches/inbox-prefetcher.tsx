import { PropsWithChildren, Suspense } from 'react';
import { GetInboxDocument, GetInboxQueryVariables } from '@/entity/planner/inbox';
import { PreloadQuery } from '@/shared/transport/graphql/server';
import { DataLoadingElement } from '@/shared/ui-kit';

interface InboxPrefetcher extends PropsWithChildren {
  readonly variables: GetInboxQueryVariables['input'];
}

function InboxPrefetcher({ variables, children }: InboxPrefetcher) {
  return (
    <PreloadQuery<undefined, GetInboxQueryVariables>
      query={GetInboxDocument}
      context={{ endpoint: 'private' }}
      variables={{ input: variables }}
    >
      <Suspense fallback={<DataLoadingElement />}>{children}</Suspense>
    </PreloadQuery>
  );
}

export { InboxPrefetcher };
