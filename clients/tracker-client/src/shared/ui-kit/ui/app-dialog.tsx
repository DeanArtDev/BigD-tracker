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
import { type PropsWithChildren, type ReactNode } from 'react';

interface AppDialogProps {
  readonly open: boolean;
  readonly showCloseButton?: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly className?: string;
  readonly trigger?: ReactNode;
  readonly footer?: ReactNode | (() => ReactNode);
  readonly onOpenChange?: (value: boolean) => void;
}

function AppDialog(props: PropsWithChildren<AppDialogProps>) {
  const {
    open,
    title,
    description,
    trigger,
    className,
    footer,
    children,
    showCloseButton,
    onOpenChange,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          'h-[calc(100%-env(safe-area-inset-top)+env(safe-area-inset-bottom))] sm:h-auto sm:max-h-[95vh]',
          'max-w-auto gap-0 flex flex-col grow items-start overflow-x-scroll pb-[env(safe-area-inset-bottom)] p-0 sm:p-0',
          className,
        )}
      >
        <div className="w-full height-[env(safe-area-inset-top)]]" />

        <DialogHeader
          className={cn('w-full p-2.5 pb-0 sm:p-4 sm:pb-0', {
            hidden: title == null && description == null,
          })}
        >
          <DialogTitle className={cn('mt-1.5 sm:mt-0 w-[95%] pr-2', { hidden: title == null })}>
            {title}
          </DialogTitle>

          <DialogDescription className={description == null ? 'hidden' : undefined}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col grow flex-wrap w-full">{children}</div>

        {footer && <DialogFooter>{isFunction(footer) ? footer() : footer}</DialogFooter>}

        <div className="w-full height-[env(safe-area-inset-bottom)]]" />
      </DialogContent>
    </Dialog>
  );
}

export { AppDialog, type AppDialogProps };
