import { PageWrapper } from '@/page/ui/page-wrapper';
import { InConstruct } from '@/shared/components/in-construct';

function GymDashboardPage() {
  return (
    <PageWrapper className="grow items-center justify-center" title="Дашборд">
      <InConstruct />
    </PageWrapper>
  );
}

export const Component = GymDashboardPage;
