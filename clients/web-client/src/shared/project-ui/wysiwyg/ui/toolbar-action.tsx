'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/shared/ui-kit/ui/button';

type ButtonProps = ComponentProps<typeof Button>;

interface ToolbarActionProps {
  readonly active?: boolean;
  readonly disabled: boolean;
  readonly ariaLabel: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
  readonly className?: string;
  readonly size?: ButtonProps['size'];
  readonly variant?: ButtonProps['variant'];
}

function ToolbarAction({
  ariaLabel,
  icon,
  active,
  className,
  disabled,
  onClick,
  size = 'sm',
  variant,
}: ToolbarActionProps) {
  return (
    <Button
      type="button"
      size={size}
      disabled={disabled}
      variant={variant ?? (active ? 'secondary' : 'ghost')}
      aria-label={ariaLabel}
      className={className}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}

export { ToolbarAction, type ToolbarActionProps };
