import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppApolloProvider, AppShellProvider, InitClientProvider } from '@/app/_providers';
import { GlobalErrorListener } from '@/shared/error-handling';
import { ToasterProvider } from '@/shared/project-ui';
import { TooltipProvider } from '@/shared/ui-kit';

import './_styles/index.css';

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
        <TooltipProvider>
          {children}

          <ToasterProvider />
          <GlobalErrorListener />
          <InitClientProvider />
        </TooltipProvider>
      </AppApolloProvider>
    </AppShellProvider>
  );
}
