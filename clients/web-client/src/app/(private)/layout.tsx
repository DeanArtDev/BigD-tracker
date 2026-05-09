import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { ReactNode } from 'react';
import { ApolloProvider } from '@/app/_providers/appolo-provider';
import { cn } from '@/shared/ui-kit/lib/utils';
import '../styles/index.css';

const roboto = Roboto({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

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
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
