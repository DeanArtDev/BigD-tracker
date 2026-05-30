import { applicationNavPaths } from '@/app/(private)/planner/_model';
import { Header } from '@/app/_ui/header';
import { ApplicationSelector } from '@/shared/project-ui';
import { Separator } from '@/shared/ui-kit';

function PlannerHeader() {
  return (
    <Header
      content={
        <div className="flex gap-4">
          <Separator orientation="vertical" />
          <ApplicationSelector items={applicationNavPaths} />
        </div>
      }
    />
  );
}

export { PlannerHeader };
