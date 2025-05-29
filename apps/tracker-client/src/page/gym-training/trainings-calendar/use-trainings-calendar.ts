import {
  useInvalidateTrainings,
  useTrainingsQuery,
  useTrainingUpdate,
} from '@/entity/trainings';
import type { ApiDto } from '@/shared/api/types';
import type { Override } from '@/shared/lib/type-helpers';
import type { EventInput } from '@fullcalendar/core';
import { useMemo, useState } from 'react';

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

const trainingTypeColorMap: Record<ApiDto['TrainingDto']['type'], string> = {
  HARD: 'bg-red-300',
  MEDIUM: 'bg-yellow-300',
  LIGHT: 'bg-green-300',
};

function useTrainingsCalendar() {
  const [filters, setFilters] = useState<{ from: string; to: string } | undefined>();
  const { data, isLoading } = useTrainingsQuery(filters);
  const invalidate = useInvalidateTrainings();
  const { update } = useTrainingUpdate({
    onSuccess: async () => void (await invalidate(filters)),
  });

  const events = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return data
      ?.filter((i) => i.startDate != null)
      .map((i) => {
        return new CalendarEvent(
          {
            start: i.startDate ?? '',
            backgroundColor: trainingTypeColorMap[i.type],
            allDay: true,
            title: i.name,
            startEditable: new Date(i.startDate ?? '') >= now,
          },
          i,
        );
      }, data);
  }, [data]);

  return {
    events,
    isLoading,

    update,
    setFilters,
  };
}

export { useTrainingsCalendar };
