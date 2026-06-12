import { PropsWithChildren } from 'react';
import { PlannerSidebar } from '@/widget/planner/planner-sidebar';
import { PlannerHeader } from './planner-header';

async function PlannerPageLayout({ open, children }: PropsWithChildren<{ open: boolean }>) {
  return <PlannerSidebar defaultOpen={open} headerSlot={<PlannerHeader />} content={children} />;
}

export { PlannerPageLayout };
