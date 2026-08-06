import { type ReactNode, Suspense } from 'react';
import { shapeGetDiaryGroupListOptions } from '@/shared/transport/graphql';
import { PreloadQuery } from '@/shared/transport/graphql/server';
import { DataLoader } from '@/shared/ui-kit';

function DiaryGroupsPrefetch({ children }: { readonly children: ReactNode }) {
  return (
    <Suspense fallback={<DataLoader.Loading />}>
      <DiaryGroupsPreload>{children}</DiaryGroupsPreload>
    </Suspense>
  );
}

async function DiaryGroupsPreload({ children }: { readonly children: ReactNode }) {
  const [query, options] = shapeGetDiaryGroupListOptions().query();

  return (
    <PreloadQuery
      query={query}
      variables={options.variables}
      errorPolicy={options.errorPolicy}
      context={options.context}
    >
      {children}
    </PreloadQuery>
  );
}

export { DiaryGroupsPrefetch };
