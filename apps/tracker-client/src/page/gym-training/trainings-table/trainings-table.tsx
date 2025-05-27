import { useTrainingDelete, useTrainingsTemplatesQuery } from '@/entity/trainings';
import { TrainingManageDialog } from '@/feature/training/training-manage-form';
import type { ApiDto } from '@/shared/api/types';
import { useDevNotifications } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
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
  const { data = [] } = useTrainingsTemplatesQuery();

  return (
    <>
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

      <div className="flex flex-col gap-4">
        <Button className="ml-auto" variant="outline" size="sm" onClick={setTrue}>
          <IconPlus />
          <span className="hidden lg:inline">Добавить тренировку</span>
        </Button>

        <DataTable<ApiDto['TrainingDto']> data={data} columns={columns} />
      </div>
    </>
  );
}

export { TrainingsTable };
