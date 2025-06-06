import { withLazy } from '@/shared/lib/react/with-lazy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui-kit/ui/tabs';
import { PageWrapper } from '../ui/page-wrapper';

const TrainingTemplatesTableLazy = withLazy(() =>
  import('./training-templates-table').then((m) => ({ default: m.TrainingTemplatesTable })),
);
const TrainingsCalendarLazy = withLazy(() =>
  import('./trainings-calendar').then((m) => ({ default: m.TrainingsCalendar })),
);

function GymTrainingPage() {
  return (
    <PageWrapper className="grow gap-4 lg:gap-8">
      <Tabs className="grow" defaultValue="next">
        <TabsList className="grid mx-auto lg:w-[400px] grid-cols-2">
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="next">Предстоящие</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col grow" value="templates">
          <TrainingTemplatesTableLazy />
        </TabsContent>
        <TabsContent className="flex flex-col grow" value="next">
          <TrainingsCalendarLazy />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

export const Component = GymTrainingPage;
