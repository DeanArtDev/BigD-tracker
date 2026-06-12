'use client';

import { Header } from '@/app/(private)/_ui/header';
import { ApplicationSelector } from '@/shared/project-ui';
import { Separator } from '@/shared/ui-kit';
import { UserSettings } from '@/widget/user-settings';
import { applicationNavPaths } from '../_model';
import { TaskCreationDialog } from '../inbox/_ui/task-creation-dialog';

function PlannerHeader() {
  return (
    <Header
      content={
        <div className="flex gap-4 justify-between grow">
          <Separator orientation="vertical" />
          <ApplicationSelector className="mr-auto" items={applicationNavPaths} />

          <TaskCreationDialog />
          <UserSettings />
        </div>
      }
    />
  );
}

export { PlannerHeader };
