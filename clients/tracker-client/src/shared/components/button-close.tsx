import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { type LucideProps, XIcon } from 'lucide-react';
import { type ComponentProps } from 'react';

type ButtonCloseProps = ComponentProps<typeof Button> & {
  readonly iconProps?: Omit<LucideProps, 'ref'>;
};

function ButtonClose({ className, iconProps, ...buttonProps }: ButtonCloseProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      type="button"
      tabIndex={-1}
      {...buttonProps}
      className={cn('size-7', 'opacity-70 bg-transparent! hover:opacity-100', className)}
    >
      <XIcon {...iconProps} className={cn('size-4', iconProps?.className)} />
    </Button>
  );
}

export { ButtonClose, type ButtonCloseProps };
