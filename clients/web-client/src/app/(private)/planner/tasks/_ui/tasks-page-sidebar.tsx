import { ReactNode } from 'react';
import { PlannerSidebar } from '@/widget/planner/planner-sidebar';
import { TasksPageHeader } from './tasks-page-header';

interface TasksPageSidebarProps {
  readonly open: boolean;
  readonly content: ReactNode;
}

function TasksPageSidebar({ open, content }: TasksPageSidebarProps) {
  return <PlannerSidebar defaultOpen={open} headerSlot={<TasksPageHeader />} content={content} />;
}

export { TasksPageSidebar, type TasksPageSidebarProps };
