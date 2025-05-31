import { useTrainingDelete, useTrainingsTemplatesQuery } from '@/entity/trainings';
import { TrainingTemplateManageDialog } from '@/feature/training/training-manage-form';
import type { ApiDto } from '@/shared/api/types';
import { useDevNotifications } from '@/shared/ui-kit/helpers';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { DataTable } from '@/shared/ui-kit/ui/data-table';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useBoolean } from 'usehooks-ts';
import { EmptyTrainings } from './empty-trainings';
import { useTrainingsTable } from './use-trainings-table';

function TrainingsTable() {
  const { inDev } = useDevNotifications();
  const { deleteTrigger, isPending } = useTrainingDelete();
  const { value, setTrue, setFalse } = useBoolean(false);
  const [training, setTraining] = useState<ApiDto['TrainingTemplateDto'] | undefined>(
    undefined,
  );

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
      <TrainingTemplateManageDialog
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

        <DataTable<ApiDto['TrainingTemplateDto']>
          data={data}
          columns={columns}
          onRowClick={() => {
            console.log('click on row');
          }}
        />
      </div>
    </DataLoader>
  );
}

export { TrainingsTable };
