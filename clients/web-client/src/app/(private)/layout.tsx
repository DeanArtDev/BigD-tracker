import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ErrorReactor } from '@/feature/error-reactor';
import { InitDataPrefetcher } from './_components';

import '../_styles/index.css';

export const metadata: Metadata = {
  title: 'Трекер',
};

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <InitDataPrefetcher>{children}</InitDataPrefetcher>

      <ErrorReactor />
    </>
  );
}
