import { cookies } from 'next/headers';
import { PlannerHeader } from '@/app/(private)/planner/_ui';
import { SIDEBAR_COOKIE_NAME, Typography } from '@/shared/ui-kit';
import { PlannerSidebar } from './_ui/planner-sidebar';

export default async function PlannerPage() {
  const open = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';

  return (
    <PlannerSidebar
      defaultOpen={open}
      headerSlot={<PlannerHeader />}
      content={
        <div className="flex flex-col items-center justify-center grow">
          <Typography.H2>В разработке 🏗️</Typography.H2>
          <Typography.P>Страница рассказывающая о Планировщике, как им пользоваться, какие преимущества</Typography.P>
        </div>
      }
    />
  );
}
