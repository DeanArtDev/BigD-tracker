import { cookies } from 'next/headers';
import { SIDEBAR_COOKIE_NAME, Typography } from '@/shared/ui-kit';
import { PlannerPageLayout } from './_ui//planner-page-layout';

export default async function PlannerPage() {
  const open = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value === 'true';

  return (
    <PlannerPageLayout open={open}>
      <div className="flex flex-col items-center justify-center grow">
        <Typography.H2>В разработке 🏗️</Typography.H2>
        <Typography.P>Страница рассказывающая о Планировщике, как им пользоваться, какие преимущества</Typography.P>
      </div>
    </PlannerPageLayout>
  );
}
