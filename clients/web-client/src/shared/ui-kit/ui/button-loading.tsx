import { ComponentProps } from 'react';
import { Button } from '@/shared/ui-kit';
import { Spinner } from './spinner';

interface ButtonLoadingProps extends ComponentProps<typeof Button> {
  readonly loading: boolean;
}

function ButtonLoading({ loading, children, disabled, ...props }: ButtonLoadingProps) {
  return (
    <Button {...props} disabled={loading || disabled}>
      {loading && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  );
}

export { ButtonLoading, type ButtonLoadingProps };
