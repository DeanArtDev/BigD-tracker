'use client';

import { TaskCreateTrigger } from '@/feature/planner/task-create';
import { PlannerHeader } from '../../_ui/planner-header';

function DiaryPageHeader() {
  return <PlannerHeader content={<TaskCreateTrigger />} />;
}

export { DiaryPageHeader };
