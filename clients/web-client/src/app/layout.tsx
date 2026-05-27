import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppApolloProvider } from '@/app/_providers';
import { GlobalErrorListener } from '@/shared/error-handling';
import { cn, Toaster } from '@/shared/ui-kit';
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
    <html lang="ru" className={cn('h-full', 'antialiased', 'font-sans', roboto.variable)}>
      <body className="min-h-dvh min-w-dvw">
        <AppApolloProvider>
          {children}
          <Toaster />
          <GlobalErrorListener />
        </AppApolloProvider>
      </body>
    </html>
  );
}
