import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppApolloProvider, AppShellProvider } from '@/app/_providers';
import { GlobalErrorListener } from '@/shared/error-handling';
import { Toaster } from '@/shared/ui-kit';
import { TooltipProvider } from '@/shared/ui-kit/ui/tooltip';

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

          <Toaster />
          <GlobalErrorListener />
        </TooltipProvider>
      </AppApolloProvider>
    </AppShellProvider>
  );
}
