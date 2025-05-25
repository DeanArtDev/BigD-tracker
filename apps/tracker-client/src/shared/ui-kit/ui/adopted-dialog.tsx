import { type PropsWithChildren, type ReactNode, Suspense } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui-kit/ui/drawer';
import { useMediaQuery } from 'usehooks-ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui-kit/ui/dialog';
import { cn } from '@/shared/ui-kit/utils';

export function AdoptedDialog({
  children,
  open,
  slotsProps,
  onOpenChange,
}: PropsWithChildren<{
  open: boolean;
  slotsProps?: {
    header?: { element?: ReactNode; description?: string };
    content?: { className?: string };
    footer?: { element?: ReactNode; className?: string };
  };
  onOpenChange: (value: boolean) => void;
}>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const showHeader =
    slotsProps?.header?.element != null || slotsProps?.header?.description != null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={slotsProps?.content?.className}>
          <Suspense fallback={<div className="w-[200px] h-[300px]">Loading</div>}>
            {showHeader && (
              <DialogHeader>
                {slotsProps?.header?.element && (
                  <DialogTitle>{slotsProps?.header?.element}</DialogTitle>
                )}
                {slotsProps?.header?.description && (
                  <DialogDescription>{slotsProps?.header?.description}</DialogDescription>
                )}
              </DialogHeader>
            )}
            {children}

            {slotsProps?.footer?.element && (
              <DialogFooter className={slotsProps?.footer?.className}>
                {slotsProps?.footer?.element}
              </DialogFooter>
            )}
          </Suspense>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn('p-4 pt-0', slotsProps?.content?.className)}>
        {showHeader && (
          <DrawerHeader className="text-left">
            {slotsProps?.header?.element && (
              <DrawerTitle>{slotsProps?.header?.element}</DrawerTitle>
            )}
            {slotsProps?.header?.description && (
              <DrawerDescription>{slotsProps?.header?.description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}

        {children}

        {slotsProps?.footer?.element && (
          <DrawerFooter className={slotsProps?.footer?.className}>
            {slotsProps?.footer?.element}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
