'use client';

import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { GroupId, useGetGroupById } from '@/entity/planner/groups';
import { routes } from '@/shared/routes';
import { DataLoader, Typography } from '@/shared/ui-kit';

function GroupPageContent({ groupId }: { groupId: GroupId }) {
  const { data, isEmpty } = useGetGroupById({ groupId });
  const group = data?.getGroup;

  return (
    <DataLoader
      isEmpty={isEmpty}
      emptyElement={
        <DataLoader.Empty
          title="Группа не найдена"
          icon={<TriangleAlert className="stroke-destructive" />}
          description={<Link href={routes.plannerGroupList.path}>Вернуться к списку групп</Link>}
        />
      }
    >
      {group != null && (
        <div className="grow min-h-0 min-w-0 px-8 py-5">
          <div className="flex flex-col gap-2">
            <Typography.H2>{group.name}</Typography.H2>

            {group.description != null && <Typography.P>{group.description}</Typography.P>}

            <Typography.P className="text-muted-foreground">Задач: {group.taskCount ?? 0}</Typography.P>
          </div>
        </div>
      )}
    </DataLoader>
  );
}

export { GroupPageContent };
