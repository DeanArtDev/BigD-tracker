import { useGetDiaryTasks } from '@/entity/planner/tasks';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { TimeView } from '@/shared/lib/time-view';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useMemo, useState } from 'react';

function DailyPlannerPage() {
  const [dateSet, setDateSet] = useState<{ from?: string; to?: string }>();
  const { things, isLoading } = useGetDiaryTasks({ filters: dateSet });

  const events = useMemo(() => {
    return things.map((thing) => {
      return {
        name: thing.name,
        from: thing.startDate != null ? new Date(thing.startDate) : 0,
        to: thing.deadline != null ? new Date(thing.deadline) : 0,
        extra: { id: thing.id },
      };
    });
  }, [things]);

  return (
    <PageWrapper className="relative grow min-h-0" title="Ежедневник">
      <DataLoader loadingElement={<AppLoader />} blur isLoading={isLoading}>
        <TimeView<{ id: number }>
          events={events}
          onDateChange={(dateSet) =>
            void setDateSet({ from: dateSet.from.toISOString(), to: dateSet.to.toISOString() })
          }
        />
      </DataLoader>
    </PageWrapper>
  );
}

export const Component = DailyPlannerPage;
