import { useTrainingDelete, useTrainingsTemplatesQuery } from '@/entity/trainings';
import { TrainingManageDialog } from '@/feature/training/training-manage-form';
import { EmptyTrainings } from './empty-trainings';
import type { ApiDto } from '@/shared/api/types';
import { useDevNotifications } from '@/shared/ui-kit/helpers';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { DataTable } from '@/shared/ui-kit/ui/data-table';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useBoolean } from 'usehooks-ts';
import { useTrainingsTable } from './use-trainings-table';

function TrainingsTable() {
  const { inDev } = useDevNotifications();
  const { deleteTrigger, isPending } = useTrainingDelete();
  const { value, setTrue, setFalse } = useBoolean(false);
  const [training, setTraining] = useState<ApiDto['TrainingDto'] | undefined>(undefined);

  const columns = useTrainingsTable({
    loading: isPending,
    onEdit: setTraining,
    onAssign: inDev,
    onDelete: (id) => void deleteTrigger({ params: { path: { trainingId: id } } }),
  });
  const { data = [], isEmpty, isLoading } = useTrainingsTemplatesQuery();

  return (
    <DataLoader
      isEmpty={isEmpty}
      isLoading={isLoading}
      loadingElement={<AppLoader />}
      emptyElement={<EmptyTrainings />}
    >
      <TrainingManageDialog
        open={value || Boolean(training)}
        training={training}
        onOpenChange={() => {
          setFalse();
          setTraining(undefined);
        }}
        onSuccess={() => {
          setFalse();
          setTraining(undefined);
        }}
      />

      <div className="flex flex-col grow gap-4">
        <Button className="ml-auto" variant="outline" size="sm" onClick={setTrue}>
          <IconPlus />
          <span className="hidden lg:inline">Добавить тренировку</span>
        </Button>

        <DataTable<ApiDto['TrainingDto']> data={data} columns={columns} />
      </div>
    </DataLoader>
  );
}

export { TrainingsTable };
