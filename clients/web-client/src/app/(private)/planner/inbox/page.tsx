import { cookies } from 'next/headers';
import { SIDEBAR_COOKIE_NAME } from '@/shared/ui-kit';
import { InboxPageWrapper } from './_ui/inbox-page-wrapper';
import { InboxSidebar } from './_ui/inbox-sidebar';

export default async function InboxPage() {
  const open = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';
  return <InboxSidebar open={open} content={<InboxPageWrapper />} />;
}
