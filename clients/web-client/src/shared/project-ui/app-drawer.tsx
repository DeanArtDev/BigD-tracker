'use client';

import { ComponentProps, ReactNode } from 'react';
import {
  cn,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui-kit';

interface AppDrawerProps {
  readonly title: string;
  readonly description?: string;
  readonly trigger?: ReactNode;
  readonly content: ReactNode;
  readonly className?: string;
  readonly modal?: boolean;
  readonly open?: boolean;
  readonly direction?: ComponentProps<typeof Drawer>['direction'];

  readonly onOpenChange?: (value: boolean) => void;
}

function AppDrawer({
  className,
  title,
  description,
  content,
  open,
  trigger,
  direction = 'right',
  modal,

  onOpenChange,
}: AppDrawerProps) {
  return (
    <Drawer modal={modal} open={open} onOpenChange={onOpenChange} direction={direction}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

      <DrawerContent className={cn(className)}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        {content}
      </DrawerContent>
    </Drawer>
  );
}

export { AppDrawer, type AppDrawerProps };
