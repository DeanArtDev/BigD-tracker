import { PageWrapper } from '@/page/ui/page-wrapper';
import { TimeView } from '@/shared/lib/time-view';

function DailyPlannerPage() {
  return (
    <PageWrapper className="grow min-h-0" title="Ежедневник">
      <TimeView<{ id: number }>
        options={{
          view: {
            timeColumnOffset: 55,
          },
        }}
        events={[
          { name: 'Ранний эвент', from: 1761210902471, to: 1761219542471, extra: { id: 4 } },
          { name: 'Ранний эвент2', from: 1761214992471, to: 1761227002471, extra: { id: 6 } },
          { name: 'Ранний эвент3', from: 1761212902471, to: 1761225002471, extra: { id: 5 } },
          { name: 'Ранний эвент4', from: 1761225002471, to: 1762527002471, extra: { id: 7 } },
        ]}
        onDateChange={(date) => {
          console.log(44, date.toISOString());
        }}
      />
    </PageWrapper>
  );
}

export const Component = DailyPlannerPage;
