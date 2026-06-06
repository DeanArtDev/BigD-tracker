import { cookies } from 'next/headers';
import { InboxPrefetcher } from '@/app/(private)/_prefetches';
import { PlannerHeader } from '@/app/(private)/planner/_ui';
import { SIDEBAR_COOKIE_NAME, Typography } from '@/shared/ui-kit';
import { Input } from '@/shared/ui-kit/ui/input';
import { PlannerSidebar } from '@/widget/planner/planner-sidebar';
import { InboxTaskList } from './inbox-task-list';

export default async function InboxPage() {
  const open = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';

  return (
    <PlannerSidebar
      defaultOpen={open}
      headerSlot={<PlannerHeader />}
      content={
        <InboxPrefetcher>
          <div className="grow grid grid-rows-[min-content_max-content_1fr] min-h-0 min-w-0 gap-3 px-8 py-5">
            <div>
              <Typography.H2>INBOX</Typography.H2>
            </div>

            <Input />

            <InboxTaskList />
          </div>
        </InboxPrefetcher>
      }
    />
  );
}
