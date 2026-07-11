import { Typography } from '@/shared/ui-kit';
import { getSidebarOpen } from './_model/server';
import { PlannerPageLayout } from './_ui//planner-page-layout';

export default async function PlannerPage() {
  const open = await getSidebarOpen();

  return (
    <PlannerPageLayout open={open}>
      <div className="flex flex-col items-center justify-center grow">
        <Typography.H2>В разработке 🏗️</Typography.H2>
        <Typography.P>Страница рассказывающая о Планировщике, как им пользоваться, какие преимущества</Typography.P>
      </div>
    </PlannerPageLayout>
  );
}
