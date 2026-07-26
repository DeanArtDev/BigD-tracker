'use client';

import { ChevronLeft, TriangleAlert } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { AppLink } from '@/shared/project-ui';
import { routes } from '@/shared/routes';
import { Button, DataLoader, ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui-kit';
import { GroupDescription } from './group-description';
import { useGetDetailedGroupSuspense } from '../_api';
import { GroupName } from './group-name';
import { GroupTaskList } from './group-task-list';

function GroupPageContent({ groupId }: { groupId: GroupId }) {
  const { group, isEmpty } = useGetDetailedGroupSuspense({ groupId });

  return (
    <DataLoader
      isEmpty={isEmpty}
      emptyElement={
        <DataLoader.Empty
          title="Группа не найдена"
          icon={<TriangleAlert className="stroke-destructive" />}
          description={<AppLink href={routes.plannerGroupList.path}>Вернуться к списку групп</AppLink>}
        />
      }
    >
      {group != null && (
        <div className="flex grow min-h-0 min-w-0 px-2 pt-5 pb-2">
          <div className="flex grow flex-col gap-4">
            <div className="flex gap-2 items-center">
              <Button asChild size="icon-lg" variant="ghost" className="mb-auto">
                <AppLink href={routes.plannerGroupList.path}>
                  <ChevronLeft className="size-7" />
                </AppLink>
              </Button>

              <GroupName id={group.id} name={group.name} />
            </div>

            <ResizablePanelGroup orientation="horizontal" className="grow">
              <ResizablePanel defaultSize="60%">
                <GroupDescription groupId={group.id} />
              </ResizablePanel>

              <ResizableHandle withHandle className="mx-2" />

              <ResizablePanel defaultSize="40%">
                <GroupTaskList groupId={group.id} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      )}
    </DataLoader>
  );
}

export { GroupPageContent };
