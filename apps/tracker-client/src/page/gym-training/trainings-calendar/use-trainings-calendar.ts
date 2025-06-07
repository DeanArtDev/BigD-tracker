import {
  useInvalidateTrainings,
  useTrainingAssign,
  useTrainingsQuery,
  useTrainingStartDateUpdate,
} from '@/entity/trainings';
import type { ApiDto } from '@/shared/api/types';
import type { Override } from '@/shared/lib/type-helpers';
import type { EventInput } from '@fullcalendar/core';
import { useEffect, useMemo, useState } from 'react';

class CalendarEvent<T extends Record<string, any>>
  implements Override<EventInput, 'start', string | Date>
{
  public start: string | Date;
  public extra?: T;
  public allDay?: boolean;
  public startEditable?: boolean;
  public title?: string;
  public backgroundColor?: string;

  constructor(data: Override<EventInput, 'start', string | Date>, extra?: T) {
    this.start = new Date(data.start).toISOString();
    this.title = data.title;
    this.backgroundColor = data.backgroundColor;
    this.allDay = data.allDay;
    this.startEditable = data.startEditable;
    this.extra = extra;
  }
}

const trainingTypeColorMap: Record<ApiDto['TrainingAggregationDto']['type'], string> = {
  HARD: 'bg-red-300',
  MEDIUM: 'bg-yellow-300',
  LIGHT: 'bg-green-300',
  MIXED: 'bg-green-300',
};

function useTrainingsCalendar() {
  const [filters, setFilters] = useState<{ from: string; to: string } | undefined>();
  const { data, isLoading } = useTrainingsQuery(filters);
  const invalidate = useInvalidateTrainings();
  const { assignTraining, isPending } = useTrainingAssign({
    onSuccess: invalidate.bind(null, undefined, { drop: true }),
  });
  const updater = useTrainingStartDateUpdate();
  const updateStartDate = (data: { id: number; startDate: string }) => void updater(data, filters);

  useEffect(() => () => void invalidate(undefined, { drop: true }), []);

  const events = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return (
      data?.map((i) => {
        return new CalendarEvent<ApiDto['TrainingAggregationDto']>(
          {
            start: i.startDate ?? '',
            backgroundColor: trainingTypeColorMap[i.type],
            allDay: true,
            title: i.name,
            startEditable: !isPending && new Date(i.startDate ?? '') >= now,
          },
          i,
        );
      }) ?? []
    );
  }, [data, isPending]);

  return {
    events,

    isLoading,
    isAssignLoading: isPending,

    assignTraining,
    setFilters,
    updateStartDate,
    invalidateCalendarData: () => invalidate(filters),
  };
}

export { useTrainingsCalendar };
