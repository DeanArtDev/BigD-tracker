import { Button } from '@/shared/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui-kit/ui/dialog';
import { cn } from '@/shared/ui-kit/utils';
import { isFunction } from 'lodash-es';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { type PropsWithChildren, type ReactNode } from 'react';

interface AppDialogProps {
  readonly open: boolean;
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  readonly className?: string;
  readonly trigger?: ReactNode;
  readonly footer?: ReactNode | (() => ReactNode);
  readonly onOpenChange?: (value: boolean) => void;
}

function AppDialog(props: PropsWithChildren<AppDialogProps>) {
  const { open, title, description, trigger, className, footer, children, onOpenChange } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        showCloseButton={false}
        className={cn(
          'p-0 sm:p-0',
          'h-full sm:max-h-[95vh]',
          'w-full max-w-[100vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw]',
          'gap-0 flex flex-col grow items-start overflow-hidden',
          className,
        )}
      >
        <div className="top-mobile-space w-full min-h-(--mobile-top-space)" />

        <AppDialogHeader
          title={title}
          description={description}
          onClose={() => void onOpenChange?.(false)}
        />

        <div className="flex min-h-0 w-full flex-col grow">{children}</div>

        {footer && (
          <DialogFooter className="w-full">{isFunction(footer) ? footer() : footer}</DialogFooter>
        )}

        <div className="bottom-mobile-space w-full min-h-(--mobile-bottom-space)" />
      </DialogContent>
    </Dialog>
  );
}

function AppDialogHeader(props: {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  showClose?: boolean;
  onClose?: React.ComponentProps<'button'>['onClick'];
}) {
  const { className, onClose, showClose = true, description, title } = props;

  return (
    <DialogHeader
      className={cn(
        'flex-row w-full p-2.5 sm:p-4 pb-0 sm:pb-0',
        { hidden: title == null && description == null },
        className,
      )}
    >
      <div className="flex flex-col w-[95%] gap-2 justify-center">
        <DialogTitle className={cn({ hidden: title == null })}>{title}</DialogTitle>

        <DialogDescription className={description == null ? 'hidden' : undefined}>
          {description}
        </DialogDescription>
      </div>

      {showClose && (
        <Button
          className="mb-auto ml-auto mt-0.5 relative -right-2 -top-2"
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      )}
    </DialogHeader>
  );
}

export { AppDialog, AppDialogHeader, type AppDialogProps };
