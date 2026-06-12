'use client';

import { ReactNode } from 'react';
import { Header } from '@/app/(private)/_ui/header';
import { ApplicationSelector } from '@/shared/project-ui';
import { Separator } from '@/shared/ui-kit';
import { UserSettings } from '@/widget/user-settings';
import { applicationNavPaths } from '../_model';

function PlannerHeader({ content }: { content?: ReactNode }) {
  return (
    <Header
      content={
        <div className="flex gap-4 justify-between grow">
          <Separator orientation="vertical" />
          <ApplicationSelector className="mr-auto" items={applicationNavPaths} />

          {content}
          <UserSettings />
        </div>
      }
    />
  );
}

export { PlannerHeader };
