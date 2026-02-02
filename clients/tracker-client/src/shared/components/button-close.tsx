import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { XIcon } from 'lucide-react';
import { type ComponentProps } from 'react';

type ButtonCloseProps = ComponentProps<typeof Button>;

function ButtonClose({ className, ...buttonProps }: ButtonCloseProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      type="button"
      tabIndex={-1}
      {...buttonProps}
      className={cn('size-7', 'opacity-70 bg-transparent! hover:opacity-100', className)}
    >
      <XIcon className="size-4" />
    </Button>
  );
}

export { ButtonClose, type ButtonCloseProps };
