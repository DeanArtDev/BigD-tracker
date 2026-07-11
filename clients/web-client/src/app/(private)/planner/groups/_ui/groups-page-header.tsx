'use client';

import { Plus } from 'lucide-react';
import { useTaskCreateContext } from '@/feature/planner/task-create';
import { Button } from '@/shared/ui-kit';
import { PlannerHeader } from '../../_ui/planner-header';

function GroupsPageHeader() {
  const { openTaskCreate } = useTaskCreateContext();

  return (
    <PlannerHeader
      content={
        <Button size="icon" onClick={() => void openTaskCreate({})}>
          <Plus />
        </Button>
      }
    />
  );
}

export { GroupsPageHeader };
