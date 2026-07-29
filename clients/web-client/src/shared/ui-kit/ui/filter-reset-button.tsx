import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '../lib/utils';

interface FilterResetButtonProps {
  readonly className?: string;
  readonly onReset: () => void;
}

function FilterResetButton({ className, onReset }: FilterResetButtonProps) {
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

export { FilterResetButton, type FilterResetButtonProps };
