import { PlannerSidebar } from '@/widget/planner/planner-sidebar';
import { InboxPageHeader } from './inbox-page-header';
import { InboxPageWrapper } from './inbox-page-wrapper';

interface InboxSidebarProps {
  readonly open: boolean;
}

function InboxSidebar({ open }: InboxSidebarProps) {
  return <PlannerSidebar defaultOpen={open} headerSlot={<InboxPageHeader />} content={<InboxPageWrapper />} />;
}

export { InboxSidebar, type InboxSidebarProps };
