import { PageWrapper } from '@/page/ui/page-wrapper';
import { InConstruct } from '@/shared/components/in-construct';

function GymProgramsPage() {
  return (
    <PageWrapper className="grow items-center justify-center" title="Программы">
      <InConstruct />
    </PageWrapper>
  );
}

export const Component = GymProgramsPage;
