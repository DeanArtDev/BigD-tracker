import { cookies } from 'next/headers';
import { PlannerHeader, PlannerSidebar } from '@/app/(private)/planner/_ui';
import { SIDEBAR_COOKIE_NAME, Typography } from '@/shared/ui-kit';

export default async function InboxPage() {
  const open = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';

  return (
    <PlannerSidebar
      defaultOpen={open}
      headerSlot={<PlannerHeader />}
      content={
        <div className="flex flex-col items-center justify-center grow">
          <Typography.H2>INBOX</Typography.H2>
        </div>
      }
    />
  );
}
