'use client';

import { useInboxQuerySuspense } from '@/entity/planner/inbox';
import { TaskCard } from '@/entity/planner/tasks';
import { DataLoader, DataErrorElement, ScrollAreaNativeVertical } from '@/shared/ui-kit';

function InboxTaskList() {
  const { data, isError, refetch } = useInboxQuerySuspense();

  return (
    <DataLoader isError={isError} errorElement={<DataErrorElement className="grow" onRetry={refetch} />}>
      <ScrollAreaNativeVertical className="p-0.5">
        <div className="flex flex-col gap-3 w-full grow min-h-0">
          {data?.tasks.map((t) => {
            return (
              <TaskCard
                key={t.id}
                id={t.id}
                name={t.name}
                repeatable
                priority={t.priority}
                status={t.status}
                deadline={t.deadline ?? undefined}
                onContentClick={() => void console.log('onContentClick')}
                onHeaderClick={() => void console.log('onHeaderClick')}
              />
            );
          })}
        </div>
      </ScrollAreaNativeVertical>
    </DataLoader>
  );
}

export { InboxTaskList };
