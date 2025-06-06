import {
  useInvalidateTrainingsTemplates,
  useTrainingsTemplatesQuery,
  useTrainingTemplateDelete,
  useTrainingTemplatesUrlParams,
} from '@/entity/training-templates';
import { useTrainingTemplateAssign } from '@/entity/training-templates/model/use-training-template-assign';
import { useInvalidateTrainings } from '@/entity/trainings';
import { TrainingTemplateManageDialog } from '@/feature/training/training-manage-form';
import { AssignTemplateDialog } from '@/page/gym-training/training-templates-table/components/assign-template-dialog';
import type { ApiDto } from '@/shared/api/types';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { DataTable } from '@/shared/ui-kit/ui/data-table';
import { Toggle } from '@/shared/ui-kit/ui/toggle';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useBoolean } from 'usehooks-ts';
import { EmptyTrainings } from './components/empty-trainings';
import { useTrainingsTable } from './model/use-trainings-table';

function TrainingTemplatesTable() {
  const { deleteTrainingTemplate, isPending: isTemplateDeleting } = useTrainingTemplateDelete();
  const invalidateTemplates = useInvalidateTrainingsTemplates();
  const invalidateTrainings = useInvalidateTrainings();

  const { value, setTrue, setFalse } = useBoolean(false);
  const [training, setTraining] = useState<ApiDto['TrainingTemplateAggregationDto'] | undefined>(
    undefined,
  );

  const { assignTrainingTemplates, isPending: isTemplateAssigning } = useTrainingTemplateAssign();
  const [assignTemplateId, setAssignTemplateId] = useState<number | undefined>(undefined);

  const columns = useTrainingsTable({
    loading: isTemplateDeleting,
    onEdit: setTraining,
    onAssign: setAssignTemplateId,
    onDelete: (id) => {
      deleteTrainingTemplate(
        { params: { path: { templateId: id } } },
        { onSuccess: invalidateTemplates },
      );
    },
  });

  const { isMy, setSearch } = useTrainingTemplatesUrlParams();
  const { data = [], isEmpty, isPending } = useTrainingsTemplatesQuery({ my: isMy });

  return (
    <>
      <AssignTemplateDialog
        loading={isTemplateAssigning}
        templateId={assignTemplateId}
        onOpenChange={(v) => {
          if (!v) setAssignTemplateId(undefined);
        }}
        onAssignDates={(date) => {
          if (date == null || assignTemplateId == null) return;
          assignTrainingTemplates(
            {
              body: {
                data: date.map((d) => ({
                  templateId: assignTemplateId,
                  startDate: d.toISOString(),
                })),
              },
            },
            {
              onSuccess: async () => {
                await invalidateTrainings(undefined, { drop: true });
                setAssignTemplateId(undefined);
              },
            },
          );
        }}
      />

      <TrainingTemplateManageDialog
        open={value || Boolean(training)}
        training={training}
        onOpenChange={() => {
          setFalse();
          setTraining(undefined);
        }}
        onSuccess={() => {
          invalidateTemplates();
          setFalse();
          setTraining(undefined);
        }}
      />

      <div className="flex flex-col grow gap-4">
        <div className="flex items-center justify-between">
          <Toggle
            pressed={isMy}
            disabled={isPending}
            size="sm"
            variant="outline"
            aria-label="мои упражнения"
            className="text-xs"
            onPressedChange={(value) => void setSearch({ my: value })}
          >
            Мои
          </Toggle>

          <Button className="ml-auto" variant="outline" size="sm" onClick={setTrue}>
            <IconPlus />
            <span className="hidden lg:inline">Добавить тренировку</span>
          </Button>
        </div>

        <DataLoader
          isEmpty={isEmpty}
          isLoading={isPending}
          loadingElement={<AppLoader />}
          emptyElement={<EmptyTrainings />}
        >
          <DataTable<ApiDto['TrainingTemplateAggregationDto']>
            data={data}
            columns={columns}
            onRowClick={() => {
              console.log('click on row');
            }}
          />
        </DataLoader>
      </div>
    </>
  );
}

export { TrainingTemplatesTable };
