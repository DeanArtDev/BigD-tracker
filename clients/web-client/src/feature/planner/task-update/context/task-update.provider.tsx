'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Task } from '@/entity/planner/tasks';
import { TaskUpdateDialog } from '../task-update-dialog';
import { taskUpdateContext, TaskUpdateContext } from './task-update.context';

function TaskUpdateProvider({ children }: { children: ReactNode }) {
  const [task, setTask] = useState<Task>();

  const value = useMemo<TaskUpdateContext>(() => ({ openTaskUpdate: setTask }), []);

  return (
    <taskUpdateContext.Provider value={value}>
      {children}

      <TaskUpdateDialog
        task={task}
        open={task != null}
        onOpenChange={(value) => {
          if (!value) setTask(undefined);
        }}
      />
    </taskUpdateContext.Provider>
  );
}

export { TaskUpdateProvider };
