'use client';

import { useInboxQuery } from '@/entity/planner/inbox';
import { TaskCard } from '@/entity/planner/tasks/ui/task-card/task-card';

function List() {
  const { data, loading } = useInboxQuery();

  if (loading) return <div>Loading...</div>;

  if (data != null) {
    return (
      <div className="flex flex-col grow w-full gap-3 p-10">
        {data.tasks?.map((t) => {
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
    );
  }

  return <div>Error!</div>;
}

export { List };
