import { mapTrainingType } from '@/entity/trainings/lib';
import type { ApiDto } from '@/shared/api/types';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { Checkbox } from '@/shared/ui-kit/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';
import { Angry, Annoyed, Blend, Smile } from 'lucide-react';
import { type JSX } from 'react';
import { TrainingsTableActions } from './trainings-table-actions';

const mapTrainingTypeIcons: Record<ApiDto['TrainingTemplateAggregationDto']['type'], JSX.Element> =
  {
    HARD: <Smile className="fill-red-400" />,
    MEDIUM: <Annoyed className="fill-yellow-400" />,
    LIGHT: <Angry className="fill-green-400" />,
    MIXED: <Blend className="fill-green-400" />,
  };

interface UseTrainingsTableParams {
  readonly loading: boolean;
  readonly onEdit: (training: ApiDto['TrainingTemplateAggregationDto']) => void;
  readonly onAssign: (trainingId: number) => void;
  readonly onDelete: (trainingId: number) => void;
}

function useTrainingsTable(
  params: UseTrainingsTableParams,
): ColumnDef<ApiDto['TrainingTemplateAggregationDto']>[] {
  const { loading, onEdit, onDelete, onAssign } = params;

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Выбрать все"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Выбрать строку"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      id: 'Имя',
      accessorKey: 'Имя',
      header: 'Имя',
      cell: ({ row }) => {
        return row.original.name;
      },
      enableHiding: false,
    },

    {
      id: 'Тип',
      accessorKey: 'Тип',
      header: 'Тип',
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {mapTrainingTypeIcons[row.original.type]}
            {mapTrainingType[row.original.type]}
          </Badge>
        </div>
      ),
    },

    {
      id: 'Разминка',
      accessorKey: 'Разминка',
      header: 'Разминка',
      cell: ({ row }) => {
        const value = row.original.wormUpDuration;
        return (
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {value ? `${value} мин` : 'Не сегодня'}
          </p>
        );
      },
    },

    {
      id: 'Заминка',
      accessorKey: 'Заминка',
      header: 'Заминка',
      cell: ({ row }) => {
        const value = row.original.postTrainingDuration;
        return (
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {value ? `${value} мин` : 'Не заминаюсь'}
          </p>
        );
      },
    },

    {
      id: 'actions',
      cell: ({ row }) => (
        <TrainingsTableActions
          disable={loading}
          onAssign={() => void onAssign(row.original.id)}
          onEdit={() => void onEdit(row.original)}
          onDelete={() => void onDelete(row.original.id)}
        />
      ),
    },
  ];
}

export { useTrainingsTable };
