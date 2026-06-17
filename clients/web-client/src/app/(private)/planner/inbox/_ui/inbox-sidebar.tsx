import { ReactNode } from 'react';
import { PlannerSidebar } from '@/widget/planner/planner-sidebar';
import { InboxPageHeader } from './inbox-page-header';

interface InboxSidebarProps {
  readonly open: boolean;
  readonly content: ReactNode;
}

function InboxSidebar({ open, content }: InboxSidebarProps) {
  return <PlannerSidebar defaultOpen={open} headerSlot={<InboxPageHeader />} content={content} />;
}

export { InboxSidebar, type InboxSidebarProps };
