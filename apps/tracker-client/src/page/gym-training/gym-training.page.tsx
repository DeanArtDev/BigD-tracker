import { PageWrapper } from '@/page/ui/page-wrapper';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui-kit/ui/tabs';

const TrainingsTableLazy = withLazy(() =>
  import('./trainings-table').then((m) => ({ default: m.TrainingsTable })),
);

function GymTrainingPage() {
  return (
    <PageWrapper className="grow gap-4 lg:gap-8">
      <Tabs defaultValue="templates">
        <TabsList className="grid w-full lg:w-[400px] grid-cols-2">
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="next">Предстоящие</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TrainingsTableLazy />
        </TabsContent>
        <TabsContent value="next">next</TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

export const Component = GymTrainingPage;
