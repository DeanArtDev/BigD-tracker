import { DeletedTasks } from './components/deleted-tasks';
import { CommonTasks } from './components/common-tasks';
import { PageWrapper } from '@/page/ui/page-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui-kit/ui/tabs';

function TasksPage() {
  return (
    <PageWrapper fixContainer className="pt-2 lg:pt-2" title="Список дел">
      <Tabs className="grow min-h-0" defaultValue="common">
        <TabsList className="mx-auto">
          <TabsTrigger value="common">Общие</TabsTrigger>
          <TabsTrigger value="deleted">Удаленные</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col grow min-h-0" value="common">
          <CommonTasks />
        </TabsContent>

        <TabsContent className="flex flex-col grow" value="deleted">
          <DeletedTasks />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

export const Component = TasksPage;
