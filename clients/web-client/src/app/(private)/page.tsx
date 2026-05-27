'use client';

import { Suspense } from 'react';
import { Spinner } from '@/shared/ui-kit';
import { TestComponent } from './test-component';
import { Header } from '../_ui/header';
import { Main } from '../_ui/main';

export default function ApplicationsPage() {
  return (
    <>
      <Header />

      <Main>
        <Suspense
          fallback={
            <div className="m-auto">
              <Spinner className="size-20 stroke-primary" />
            </div>
          }
        >
          <TestComponent />
        </Suspense>
      </Main>
    </>
  );
}
