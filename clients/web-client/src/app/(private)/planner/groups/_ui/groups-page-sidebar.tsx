import { ReactNode } from 'react';
import { PlannerSidebar } from '@/widget/planner/planner-sidebar';
import { GroupsPageHeader } from './groups-page-header';

interface InboxSidebarProps {
  readonly open: boolean;
  readonly content: ReactNode;
}

function GroupsPageSidebar({ open, content }: InboxSidebarProps) {
  return <PlannerSidebar defaultOpen={open} headerSlot={<GroupsPageHeader />} content={content} />;
}

export { GroupsPageSidebar, type InboxSidebarProps };
