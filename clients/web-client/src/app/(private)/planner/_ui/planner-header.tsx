'use client';

import { ReactNode } from 'react';
import { Header } from '@/app/(private)/_ui/header';
import { ApplicationSelector } from '@/shared/project-ui';
import { Separator } from '@/shared/ui-kit';
import { UserSettings } from '@/widget/user-settings';
import { CalendarViewer } from './calendar-viewer';
import { applicationNavPaths } from '../_model';

function PlannerHeader({ content }: { content?: ReactNode }) {
  return (
    <Header
      className="fixed inset-0 w-full z-10"
      content={
        <div className="flex gap-4 justify-between grow">
          <Separator orientation="vertical" />
          <ApplicationSelector className="mr-auto" items={applicationNavPaths} />

          <CalendarViewer />
          {content}
          <UserSettings />
        </div>
      }
    />
  );
}

export { PlannerHeader };
