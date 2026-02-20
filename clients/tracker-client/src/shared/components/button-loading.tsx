import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import type { ComponentProps } from 'react';

interface ButtonLoadingProps extends ComponentProps<typeof Button> {
  readonly hideContent?: boolean;
  readonly isLoading?: boolean;
}

function ButtonLoading({
  isLoading,
  hideContent = false,
  children,
  disabled,
  ...buttonProps
}: ButtonLoadingProps) {
  return (
    <Button {...buttonProps} disabled={isLoading || disabled}>
      {isLoading && <AppLoader inverse size={20} />}
      {isLoading && hideContent ? null : children}
    </Button>
  );
}

export { ButtonLoading, type ButtonLoadingProps };
