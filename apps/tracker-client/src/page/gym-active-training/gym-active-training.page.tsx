import { useActiveTrainingQuery } from '@/entity/trainings';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { ErrorPlaceholder } from '@/shared/components/error-placeholder';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { ActiveTraining } from './components/active-training';

function GymCurrentTraining() {
  const { activeTraining, isLoading, isError, isNotFound, refetch } = useActiveTrainingQuery();

  return (
    <PageWrapper className="grow gap-4 pt-4 pb-8 lg:gap-8">
      <DataLoader
        isEmpty={isNotFound}
        isLoading={isLoading}
        isError={isError && !isNotFound}
        errorElement={<ErrorPlaceholder onRetry={refetch} />}
        loadingElement={<AppLoader />}
        emptyElement={
          <div className="border-2 border-dotted rounded-lg grow p-2 m-4 flex flex-col justify-center items-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center mb-4">
              Сегодня нет тренири чилим 😎
            </h3>
          </div>
        }
      >
        {activeTraining != null && <ActiveTraining training={activeTraining} />}
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GymCurrentTraining;
