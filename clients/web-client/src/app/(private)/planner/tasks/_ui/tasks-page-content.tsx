'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger, Typography } from '@/shared/ui-kit';
import { ArchivedTasksTabContent } from './archived-tasks-tab-content';
import { CurrentTasksTabContent } from './current-tasks-tab-content';
import { DeletedTasksTabContent } from './deleted-tasks-tab-content';
import { useTasksUrlQuery } from '../_model/use-tasks-url-query';

function TasksPageContent() {
  const [searchQuery, setSearchQuery] = useTasksUrlQuery();
  const activeTab = searchQuery?.tab;

  return (
    <div className="flex grow min-h-0 min-w-0 flex-col gap-2 px-8 py-5">
      <Typography.H2>Дела</Typography.H2>

      <Tabs
        value={activeTab?.toString()}
        className="grow min-h-0 gap-4"
        onValueChange={(value) => {
          setSearchQuery((previousQuery) => ({ ...previousQuery, tab: Number(value) as 1 | 2 | 3 }));
        }}
      >
        <div className="border-b">
          <TabsList variant="line" className="justify-start pl-0">
            <TabsTrigger value="1" className="border-none after:bg-primary after:rounded-2xl">
              Текущие
            </TabsTrigger>
            <TabsTrigger value="2" className="border-none after:bg-primary after:rounded-2xl">
              Архивные
            </TabsTrigger>
            <TabsTrigger value="3" className="border-none after:bg-primary after:rounded-2xl">
              Удалённые
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="1" className="min-h-0 flex flex-col gap-4">
          <CurrentTasksTabContent />
        </TabsContent>

        <TabsContent value="2" className="min-h-0 flex flex-col gap-4">
          <ArchivedTasksTabContent />
        </TabsContent>

        <TabsContent value="3" className="min-h-0 flex flex-col gap-4">
          <DeletedTasksTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { TasksPageContent };
