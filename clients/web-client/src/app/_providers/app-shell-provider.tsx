import { PropsWithChildren } from 'react';
import { appFonts } from '@/app/_lib/fonts';
import { cn } from '@/shared/ui-kit';

import '@/app/_styles/index.css';

const roboto = appFonts.Roboto;

function AppShellProvider({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className={cn('h-full', 'antialiased', 'font-sans', roboto.variable)}>
      <body>{children}</body>
    </html>
  );
}

export { AppShellProvider };
