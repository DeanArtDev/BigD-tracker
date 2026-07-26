'use client';

import { Check, ChevronsLeftRight, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { applicationNavPaths } from '@/app/(private)/planner/_model';
import { RoutePaths, routes } from '@/shared/routes';
import { Button, cn, PopoverHeader, Separator, Typography } from '@/shared/ui-kit';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui-kit';
import { AppLink } from './app-link';

interface ApplicationSelectorProps {
  readonly className?: string;
  readonly items: {
    readonly disabled?: boolean;
    readonly path: RoutePaths;
    readonly icon: ReactNode;
    readonly title: ReactNode;
  }[];
}

function ApplicationSelector({ items, className }: ApplicationSelectorProps) {
  const pathname = usePathname();
  const current = useMemo(() => items.find((p) => pathname.startsWith(p.path)), [pathname, items]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={cn('flex gap-2', className)} variant="outline">
          {current != null ? (
            <>
              {current.icon}
              {current.title}
            </>
          ) : null}
          <ChevronsLeftRight className="rotate-90" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[220px] gap-1 p-1.5">
        <PopoverHeader>
          <Typography.Muted className="pl-2">Приложения</Typography.Muted>
        </PopoverHeader>
        <Separator />

        {applicationNavPaths.map(({ path, title, icon, disabled }) => {
          const isSelected = current?.path === path;

          return (
            <Button
              key={path}
              disabled={disabled}
              className={cn('flex gap-2 justify-start pl-2', {
                'text-primary': isSelected,
                'text-muted-foreground': disabled,
              })}
              variant={isSelected ? 'secondary' : 'ghost'}
              asChild
            >
              <AppLink
                href={path}
                onNavigate={(evt) => {
                  if (disabled || isSelected) evt.preventDefault();
                }}
              >
                {icon}
                {title}
                {isSelected ? <Check className="ml-auto" /> : null}
              </AppLink>
            </Button>
          );
        })}

        <Separator className="m-0" />
        <Button className="flex gap-2 justify-start pl-2" variant="ghost" asChild>
          <AppLink href={routes.home.path}>
            <LayoutGrid className="stroke-muted-foreground" />К списку приложений
          </AppLink>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export { ApplicationSelector };
