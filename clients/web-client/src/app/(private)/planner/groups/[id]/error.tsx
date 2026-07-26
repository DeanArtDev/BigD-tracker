'use client';

import { exceptionCode } from '@big-d/exceptions';
import { TriangleAlert } from 'lucide-react';
import { AppLink } from '@/shared/project-ui';
import { routes } from '@/shared/routes';
import { isApiError } from '@/shared/transport/graphql';
import { DataLoader } from '@/shared/ui-kit';

export default function GroupError({ error }: { error: unknown }) {
  if (isApiError(error) && error.code === exceptionCode.groupNotFound.code) {
    return (
      <DataLoader.Empty
        title="Группа не найдена"
        icon={<TriangleAlert className="stroke-destructive" />}
        description={<AppLink href={routes.plannerGroupList.path}>Вернуться к списку групп</AppLink>}
      />
    );
  }

  throw error;
}
