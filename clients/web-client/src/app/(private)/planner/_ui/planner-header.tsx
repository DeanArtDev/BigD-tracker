import { Header } from '@/app/(private)/_ui/header';
import { applicationNavPaths } from '@/app/(private)/planner/_model';
import { ApplicationSelector } from '@/shared/project-ui';
import { Separator } from '@/shared/ui-kit';
import { UserSettings } from '@/widget/user-settings';

function PlannerHeader() {
  return (
    <Header
      content={
        <div className="flex gap-4 justify-between grow">
          <Separator orientation="vertical" />
          <ApplicationSelector className="mr-auto" items={applicationNavPaths} />

          <UserSettings />
        </div>
      }
    />
  );
}

export { PlannerHeader };
