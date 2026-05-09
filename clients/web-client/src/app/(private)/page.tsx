import { Suspense } from 'react';
import { Header } from '@/app/ui/header';
import { Main } from '@/app/ui/main';
import { TestComponent } from './test-component';

export default async function ApplicationsPage() {
  return (
    <>
      <Header />

      <Main>
        <Suspense fallback={<p>Загрузка...</p>}>
          <TestComponent />
        </Suspense>
      </Main>
    </>
  );
}
