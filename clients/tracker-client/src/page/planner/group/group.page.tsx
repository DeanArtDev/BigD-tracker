import { useGroupsQuery } from '@/entity/planner/groups';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppPlaceholder } from '@/shared/components/app-placeholder';
import { useUrlParams } from '@/shared/lib/react/use-url-params';
import { routes } from '@/shared/lib/routes';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';
import { GroupEditController } from './components/group-edit-controller';

const schema = z.object({ groupId: z.coerce.number() });

function GroupPage() {
  const params = useUrlParams(schema);

  const { groups, isPending } = useGroupsQuery();

  if (params?.groupId == null) {
    return <Navigate to={routes.planner.path} />;
  }

  const group = groups?.byId[params?.groupId];

  return (
    <PageWrapper title="Группа" className="flex w-full min-h-0 min-w-0 grow p-0 lg:pt-0">
      <DataLoader
        isLoading={isPending}
        isEmpty={group == null}
        emptyElement={<AppPlaceholder message="Группа не найдена" />}
      >
        <GroupEditController group={group!} />
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GroupPage;
