import { plannerRoutesMap } from '@/page/planner/lib/constants';
import { ApplicationPanel } from '@/page/ui/application-panel';
import { PageWrapper } from '@/page/ui/page-wrapper';

const routes = Object.values(plannerRoutesMap);

function PlannerPage() {
  return (
    <PageWrapper className="grow py-8! items-center" title="Планировщик">
      <ApplicationPanel routes={routes} />
    </PageWrapper>
  );
}

export const Component = PlannerPage;
