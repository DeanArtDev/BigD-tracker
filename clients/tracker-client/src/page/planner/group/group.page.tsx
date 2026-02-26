import { useGroupByIdQuery } from '@/entity/planner/groups';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import { useUrlParams } from '@/shared/lib/react/use-url-params';
import { routes } from '@/shared/lib/routes';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';
import { GroupEditController } from './components/group-edit-controller';

const schema = z.object({ groupId: z.coerce.number() });

function GroupPage() {
  const params = useUrlParams(schema);

  const { groupById, isPending } = useGroupByIdQuery({ groupId: params?.groupId });

  if (params?.groupId == null) {
    return <Navigate to={routes.planner.path} replace />;
  }

  return (
    <PageWrapper title="Группа">
      <DataLoader
        isLoading={isPending}
        isEmpty={groupById == null}
        emptyElement={<AppEmptyPlaceholder message="Группа не найдена" />}
      >
        <GroupEditController group={groupById!} />
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GroupPage;
