import { getSidebarOpen } from '../_model/server';
import { InboxPageContent } from './_ui/inbox-page-content';
import { InboxSidebar } from './_ui/inbox-sidebar';

export default async function InboxPage() {
  const open = await getSidebarOpen();
  return <InboxSidebar open={open} content={<InboxPageContent />} />;
}
