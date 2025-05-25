import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useTrainingsQuery } from '@/entity/trainings';
import { LoaderCircle } from 'lucide-react';
import { PageWrapper } from '../ui/page-wrapper';
import { EmptyTrainings } from './empty-trainings';

function GymTrainingPage() {
  const { data, isEmpty, isLoading } = useTrainingsQuery();

  return (
    <PageWrapper className="grow">
      <DataLoader
        isEmpty={isEmpty}
        isLoading={isLoading}
        loadingElement={
          <LoaderCircle color="#8e51ff" className="animate-spin m-auto" size={70} />
        }
        emptyElement={<EmptyTrainings />}
      >
        <div>{JSON.stringify(data, null, 2)}</div>
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = GymTrainingPage;
