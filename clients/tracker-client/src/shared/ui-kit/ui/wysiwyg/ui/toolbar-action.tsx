import { Button } from '@/shared/ui-kit/ui/button';
import type { ReactNode } from 'react';

interface ToolbarActionProps {
  readonly active?: boolean;
  readonly disabled: boolean;
  readonly ariaLabel: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
}

function ToolbarAction({ ariaLabel, icon, active, disabled, onClick }: ToolbarActionProps) {
  return (
    <Button
      type="button"
      size="sm"
      disabled={disabled}
      variant={active ? 'secondary' : 'ghost'}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}

export { ToolbarAction, type ToolbarActionProps };
