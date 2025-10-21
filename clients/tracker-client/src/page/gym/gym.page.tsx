import { gymRoutesMap } from '@/page/gym/lib/constants';
import { ApplicationPanel } from '@/page/ui/application-panel';
import { PageWrapper } from '@/page/ui/page-wrapper';

const routes = Object.values(gymRoutesMap);

function GymPage() {
  return (
    <PageWrapper className="grow py-8! items-center" title="Тренировки">
      <ApplicationPanel routes={routes} />
    </PageWrapper>
  );
}

export const Component = GymPage;
