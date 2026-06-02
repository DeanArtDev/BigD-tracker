import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';
import { SIDEBAR_COOKIE_NAME } from '@/shared/ui-kit';
import { PlannerHeader } from './planner-header';
import { PlannerSidebar } from './planner-sidebar';

async function PlannerPageLayout({ children }: PropsWithChildren) {
  const open = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';

  return <PlannerSidebar defaultOpen={open} headerSlot={<PlannerHeader />} content={children} />;
}

export { PlannerPageLayout };
