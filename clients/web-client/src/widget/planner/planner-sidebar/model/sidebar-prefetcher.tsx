import { PropsWithChildren, Suspense } from 'react';
import { PreloadQuery } from '@/shared/transport/graphql/server';
import { DataLoadingElement } from '@/shared/ui-kit';
import { GetSidebarInfoQueryDocument } from './schemas/planner-sidebar.queries.generated';

function SidebarPrefetcher({ children }: PropsWithChildren) {
  return (
    <PreloadQuery query={GetSidebarInfoQueryDocument} context={{ endpoint: 'private' }}>
      <Suspense
        fallback={
          <div className="flex h-screen">
            <DataLoadingElement size={120} />
          </div>
        }
      >
        {children}
      </Suspense>
    </PreloadQuery>
  );
}

export { SidebarPrefetcher };
