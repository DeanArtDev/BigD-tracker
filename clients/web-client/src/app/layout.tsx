import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { AppApolloProvider, AppShellProvider, InitClientProvider, PwaProvider } from '@/app/_providers';
import { GlobalErrorListener } from '@/shared/error-handling';
import { AppToasterProvider } from '@/shared/project-ui';
import { TooltipProvider } from '@/shared/ui-kit';

import './_styles/index.css';

export const metadata: Metadata = {
  applicationName: 'Big D',
  description: 'Планировщик дел и целей',
  title: 'Трекер',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Big D',
  },
};

export const viewport: Viewport = {
  themeColor: '#7000f5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppShellProvider>
      <AppApolloProvider>
        <TooltipProvider>
          {children}

          <AppToasterProvider />
          <GlobalErrorListener />
          <InitClientProvider />
          <PwaProvider />
        </TooltipProvider>
      </AppApolloProvider>
    </AppShellProvider>
  );
}
