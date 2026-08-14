import { PropsWithChildren, ReactNode } from 'react';
import { AppLink, BigDLogo } from '@/shared/project-ui';
import { routes } from '@/shared/routes';
import { cn } from '@/shared/ui-kit/lib/utils';

interface HeaderProps {
  readonly className?: string;
  readonly content?: ReactNode;
}

function Header({ className, content }: PropsWithChildren<HeaderProps>) {
  return (
    <header
      className={cn(
        'flex items-center py-2 px-4 gap-4 border @container/header h-full max-h-(--header-height)',
        className,
      )}
    >
      <AppLink href={routes.home.path}>
        <BigDLogo aria-label="Logo" className="h-7 w-auto text-black" role="img" />
      </AppLink>

      {content}
    </header>
  );
}

export { Header, type HeaderProps };
