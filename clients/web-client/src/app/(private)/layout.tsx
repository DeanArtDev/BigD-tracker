import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ErrorReactor } from '@/feature/error-reactor';
import { ConfirmDialogProvider } from '@/shared/project-ui';
import { InitDataPrefetcher } from './_prefetches';
import { InitDataLoader } from './_ui/init-data-loader';

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
        <InitDataLoader>
          <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        </InitDataLoader>
      </InitDataPrefetcher>

      <ErrorReactor />
    </>
  );
}
