import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppApolloProvider, AppShellProvider } from '@/app/_providers';
import { GlobalErrorListener } from '@/shared/error-handling';
import { Toaster } from '@/shared/ui-kit';
import { appFonts } from './_lib/fonts';

import './_styles/index.css';

const roboto = appFonts.Roboto;

export const metadata: Metadata = {
  title: 'Трекер',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppShellProvider>
      <AppApolloProvider>
        {children}
        <Toaster />
        <GlobalErrorListener />
      </AppApolloProvider>
    </AppShellProvider>
  );
}
