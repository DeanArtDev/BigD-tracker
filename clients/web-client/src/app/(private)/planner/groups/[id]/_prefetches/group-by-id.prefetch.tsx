import { ReactNode, Suspense } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { GroupTaskOrder } from '@/entity/schema-types';
import { shapeGetDetailedGroupOptions } from '@/shared/transport/graphql';
import { PreloadQuery } from '@/shared/transport/graphql/server';
import { DataLoader } from '@/shared/ui-kit';

async function GroupByIdPrefetch({ groupId, children }: { groupId: GroupId; children: ReactNode }) {
  const [query, options] = shapeGetDetailedGroupOptions({ groupId, order: GroupTaskOrder.Group }).query({
    errorPolicy: 'ignore',
  });

  return (
    <PreloadQuery
      query={query}
      variables={options.variables}
      errorPolicy={options.errorPolicy}
      context={options.context}
    >
      <Suspense fallback={<DataLoader.Loading />}>{children}</Suspense>
    </PreloadQuery>
  );
}

export { GroupByIdPrefetch };
