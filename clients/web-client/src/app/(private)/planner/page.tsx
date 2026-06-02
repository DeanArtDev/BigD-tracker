import { Typography } from '@/shared/ui-kit';
import { PlannerPageLayout } from './_ui/';

export default async function PlannerPage() {
  return (
    <PlannerPageLayout>
      <div className="flex flex-col items-center justify-center grow">
        <Typography.H2>В разработке 🏗️</Typography.H2>
        <Typography.P>Страница рассказывающая о Планировщике, как им пользоваться, какие преимущества</Typography.P>
      </div>
    </PlannerPageLayout>
  );
}
