import { X } from 'lucide-react';
import { ComponentProps } from 'react';
import { Button } from './button';
import { cn } from '../lib/utils';

type ResetButtonProps = ComponentProps<typeof Button> & {
  readonly className?: string;
  readonly show?: boolean;
  readonly onReset: () => void;
};

function ResetButton({ show, className, onReset }: ResetButtonProps) {
  if (!show) return null;
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="destructive"
      className={cn('size-5.5 rounded-xl p-0', className)}
      aria-label="Сбросить фильтр"
      onClick={(event) => {
        event.stopPropagation();
        onReset();
      }}
    >
      <X className="size-4" />
    </Button>
  );
}

export { ResetButton, type ResetButtonProps };
