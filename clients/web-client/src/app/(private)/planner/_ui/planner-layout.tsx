import { ReactNode } from 'react';
import { Header } from '@/app/_ui/header';
import { Main } from '@/app/_ui/main';
import { Button } from '@/shared/ui-kit';

function PlannerLayout({ children, headerSlot }: Readonly<{ children: ReactNode; headerSlot?: ReactNode }>) {
  return (
    <div className="grid min-h-screen grid-rows-[64px_1fr]">
      {headerSlot ?? <Header content={<Button variant="outline">Приложение</Button>} />}

      <Main className="p-10">{children}</Main>
    </div>
  );
}

export { PlannerLayout };
