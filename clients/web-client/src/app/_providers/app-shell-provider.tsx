import { PropsWithChildren } from 'react';
import { appFonts } from '@/app/_lib/fonts';
import { NavigationProgressProvider } from '@/shared/project-ui';
import { cn } from '@/shared/ui-kit';

import '@/app/_styles/index.css';

const roboto = appFonts.Roboto;

function AppShellProvider({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className={cn('antialiased', 'font-sans', roboto.variable)}>
      <body>
        <NavigationProgressProvider>{children}</NavigationProgressProvider>
      </body>
    </html>
  );
}

export { AppShellProvider };
