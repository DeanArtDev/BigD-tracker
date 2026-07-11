'use client';

import { ReactNode, useMemo, useState } from 'react';
import { TaskCreateDialog } from '../task-create-dialog';
import { taskCreateContext, TaskCreateContext } from './task-create.context';

function TaskCreateProvider({ children }: { children: ReactNode }) {
  const [creatingData, setCreatingData] = useState<Parameters<TaskCreateContext['openTaskCreate']>[0]>();

  const value = useMemo<TaskCreateContext>(() => ({ openTaskCreate: setCreatingData }), []);

  return (
    <taskCreateContext.Provider value={value}>
      {children}

      <TaskCreateDialog
        groupId={creatingData?.groupId}
        open={creatingData != null}
        onSuccess={creatingData?.onSuccess}
        onOpenChange={(value) => {
          if (!value) setCreatingData(undefined);
        }}
      />
    </taskCreateContext.Provider>
  );
}

export { TaskCreateProvider };
