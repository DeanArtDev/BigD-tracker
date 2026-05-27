import { ComponentProps } from 'react';
import { Button } from '@/shared/ui-kit';
import { Spinner } from './spinner';

interface ButtonLoadingProps extends ComponentProps<typeof Button> {
  readonly loading: boolean;
}

function ButtonLoading({ loading, children, ...props }: ButtonLoadingProps) {
  return (
    <Button {...props} disabled={loading}>
      {loading && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  );
}

export { ButtonLoading, type ButtonLoadingProps };
