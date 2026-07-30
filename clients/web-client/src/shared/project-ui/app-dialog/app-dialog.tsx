import * as React from 'react';
import { ReactNode } from 'react';
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollAreaNativeVertical,
} from '@/shared/ui-kit';
import { isToasterClosest } from '../app-toaster';

interface AppDialogProps {
  readonly title: ReactNode;
  readonly description?: string;
  readonly trigger?: ReactNode;
  readonly content: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
  readonly modal?: boolean;
  readonly open?: boolean;
  readonly verticalScroll?: boolean;

  readonly onOpenChange?: (value: boolean) => void;
}

function AppDialog(props: AppDialogProps) {
  const {
    title,
    content,
    footer,
    description = '',
    className,
    verticalScroll = true,
    trigger,
    modal,
    open,
    onOpenChange,
  } = props;

  return (
    <Dialog open={open} modal={modal} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className={cn('sm:max-w-200 p-0 gap-0', className)}
        onPointerDownOutside={(evt) => {
          if (isToasterClosest(evt)) {
            evt.preventDefault();
          }
        }}
        onInteractOutside={(evt) => {
          if (isToasterClosest(evt)) {
            evt.preventDefault();
          }
        }}
      >
        <DialogHeader className="border-b pt-4 px-4 mb-auto">
          <DialogTitle>{title}</DialogTitle>

          {description != null ? (
            <DialogDescription className="mb-3">{description}</DialogDescription>
          ) : (
            <DialogDescription />
          )}
        </DialogHeader>

        {verticalScroll ? (
          <ScrollAreaNativeVertical className="h-fit max-h-[65vh]">{content}</ScrollAreaNativeVertical>
        ) : (
          content
        )}

        {footer && <DialogFooter className="m-0 mt-auto">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export { AppDialog };
