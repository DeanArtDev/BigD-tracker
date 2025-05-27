import { useTrainingsTemplatesQuery } from '@/entity/trainings';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { EmptyTrainings } from './empty-trainings';

const TrainingsTableLazy = withLazy(() =>
  import('./trainings-table').then((m) => ({ default: m.TrainingsTable })),
);

function GymTrainingPage() {
  const { isEmpty, isLoading } = useTrainingsTemplatesQuery();

  return (
    <PageWrapper className="grow  gap-4 lg:gap-8">
      <DataLoader
        isEmpty={isEmpty}
        isLoading={isLoading}
        loadingElement={<AppLoader />}
        emptyElement={<EmptyTrainings />}
      >
        <TrainingsTableLazy />
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GymTrainingPage;
