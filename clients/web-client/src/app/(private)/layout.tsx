import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { GroupListDrawerProvider } from '@/entity/planner/groups';
import { ErrorReactor } from '@/feature/error-reactor';
import { ConfirmDialogProvider } from '@/shared/project-ui';
import { InitDataPrefetcher } from './_prefetches';

import '../_styles/index.css';

export const metadata: Metadata = {
  title: 'Трекер',
};

export default function PrivateRoutesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <InitDataPrefetcher>
        <ConfirmDialogProvider>
          <GroupListDrawerProvider>{children}</GroupListDrawerProvider>
        </ConfirmDialogProvider>
      </InitDataPrefetcher>

      <ErrorReactor />
    </>
  );
}
